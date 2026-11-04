const bcrypt = require("bcryptjs");
const db = require("../config/database");

async function contextoConta(req) {
  const auth = req.auth || {};

  if (auth.papel === "empresa" && auth.cnpj) {
    return {
      tipoConta: "empresa",
      ehAdmin: false,
      tabela: "Empresa",
      colunaChave: "CNPJ",
      chave: auth.cnpj,
      select: `
        SELECT
          CNPJ AS cnpj,
          email,
          Nome AS nome,
          Tipo AS tipoEmpresa
        FROM Empresa
        WHERE CNPJ = ?
      `,
    };
  }

  // Conta de usuário: é admin só se for admin da empresa em que entrou agora.
  // Sem empresa escolhida (home pessoal), não é admin.
  let ehAdmin = false;
  if (auth.cnpj && auth.email) {
    const [admins] = await db.query(
      `SELECT 1 FROM Empresa_Adm WHERE f_email = ? AND f_CNPJ = ? LIMIT 1`,
      [auth.email, auth.cnpj]
    );
    ehAdmin = admins.length > 0;
  }

  return {
    tipoConta: "usuario",
    ehAdmin,
    tabela: "Usuario",
    colunaChave: "email",
    chave: auth.email,
    select: `
      SELECT
        email,
        Nome AS nome,
        CPF AS cpf
      FROM Usuario
      WHERE email = ?
    `,
  };
}

async function buscarPerfil(req, res) {
  try {
    const ctx = await contextoConta(req);

    const [rows] = await db.query(ctx.select, [ctx.chave]);

    if (rows.length === 0) {
      return res.status(404).json({ erro: "Conta não encontrada." });
    }

    return res.json({
      tipoConta: ctx.tipoConta,
      ehAdmin: ctx.ehAdmin,
      ...rows[0],
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ erro: "Erro ao buscar perfil." });
  }
}

async function atualizarPerfil(req, res) {
  try {
    const ctx = await contextoConta(req);
    const { nome, senhaAtual, novaSenha } = req.body;

    const [rows] = await db.query(
      `SELECT senha FROM ${ctx.tabela} WHERE ${ctx.colunaChave} = ?`,
      [ctx.chave]
    );

    if (rows.length === 0) {
      return res.status(404).json({ erro: "Conta não encontrada." });
    }

    const campos = [];
    const valores = [];

    if (typeof nome === "string") {
      const nomeLimpo = nome.trim();

      if (nomeLimpo.length < 2) {
        return res.status(400).json({ erro: "Nome inválido." });
      }

      campos.push("Nome = ?");
      valores.push(nomeLimpo);
    }

    if (novaSenha) {
      if (!senhaAtual) {
        return res.status(400).json({ erro: "Informe a senha atual." });
      }

      if (novaSenha.length < 6) {
        return res.status(400).json({
          erro: "A nova senha deve ter pelo menos 6 caracteres.",
        });
      }

      const confere = await bcrypt.compare(senhaAtual, rows[0].senha);

      if (!confere) {
        return res.status(401).json({ erro: "Senha atual incorreta." });
      }

      campos.push("senha = ?");
      valores.push(await bcrypt.hash(novaSenha, 10));
    }

    if (campos.length === 0) {
      return res.status(400).json({ erro: "Nada para atualizar." });
    }

    await db.query(
      `UPDATE ${ctx.tabela} SET ${campos.join(", ")} WHERE ${ctx.colunaChave} = ?`,
      [...valores, ctx.chave]
    );

    const [atualizado] = await db.query(ctx.select, [ctx.chave]);

    return res.json({
      tipoConta: ctx.tipoConta,
      ehAdmin: ctx.ehAdmin,
      ...atualizado[0],
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ erro: "Erro ao atualizar perfil." });
  }
}

module.exports = { buscarPerfil, atualizarPerfil };