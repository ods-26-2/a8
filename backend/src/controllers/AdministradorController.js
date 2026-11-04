const bcrypt = require("bcryptjs");
const db = require("../config/database");

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function cadastrar(req, res) {
  // exigirContexto("empresa") garante que só empresa/condomínio chega aqui
  const cnpj = req.contexto.cnpj;

  const nome = String(req.body.nome ?? "").trim();
  const email = String(req.body.email ?? "").trim().toLowerCase();
  const cpf = String(req.body.cpf ?? "").replace(/\D/g, "");
  const senha = String(req.body.senha ?? "");

  if (nome.length < 2) return res.status(400).json({ erro: "Informe o nome completo." });
  if (!EMAIL_VALIDO.test(email)) return res.status(400).json({ erro: "Informe um e-mail válido." });
  if (cpf.length !== 11) return res.status(400).json({ erro: "O CPF deve ter 11 números." });
  if (senha.length < 8) return res.status(400).json({ erro: "A senha deve ter no mínimo 8 caracteres." });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    let usuarioJaExistia = false;

    const [porEmail] = await conn.query(
      "SELECT email, CPF FROM Usuario WHERE email = ? FOR UPDATE",
      [email]
    );

    if (porEmail.length > 0) {
      // Já existe conta com esse e-mail: só vincula (não altera nome nem senha dela)
      if (porEmail[0].CPF !== cpf) {
        await conn.rollback();
        return res.status(409).json({ erro: "Este e-mail já está cadastrado com outro CPF." });
      }
      usuarioJaExistia = true;
    } else {
      const [porCpf] = await conn.query("SELECT email FROM Usuario WHERE CPF = ?", [cpf]);
      if (porCpf.length > 0) {
        await conn.rollback();
        return res.status(409).json({ erro: "Este CPF já está cadastrado." });
      }

      // Se suas senhas NÃO usam bcrypt no login, troque o hash pelo mesmo método do cadastro de usuário
      const hash = await bcrypt.hash(senha, 10);
      await conn.query(
        "INSERT INTO Usuario (email, Nome, senha, CPF) VALUES (?, ?, ?, ?)",
        [email, nome, hash, cpf]
      );
    }

    const [jaAdm] = await conn.query(
      "SELECT 1 FROM Empresa_Adm WHERE f_email = ? AND f_CNPJ = ? LIMIT 1",
      [email, cnpj]
    );
    if (jaAdm.length > 0) {
      await conn.rollback();
      return res.status(409).json({ erro: "Este usuário já é administrador." });
    }

    await conn.query("INSERT INTO Empresa_Adm (f_CNPJ, f_email) VALUES (?, ?)", [cnpj, email]);

    await conn.commit();

    return res.status(201).json({
      mensagem: usuarioJaExistia
        ? "Usuário já cadastrado: vinculado como administrador."
        : "Administrador cadastrado com sucesso!",
    });
  } catch (e) {
    await conn.rollback();
    console.error(e);
    return res.status(500).json({ erro: "Erro ao cadastrar administrador." });
  } finally {
    conn.release();
  }
}

module.exports = { cadastrar };