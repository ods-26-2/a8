const pool = require("../config/database");
const bcrypt = require("bcrypt");
const { gerarToken } = require("../utils/token");


async function fazerLogin(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        erro: "Email e senha são obrigatórios",
      });
    }

    // =====================================================
    // 1. VERIFICA SE É UMA EMPRESA OU CONDOMÍNIO
    // =====================================================

    const [empresas] = await pool.query(
      `SELECT CNPJ, Nome, email, senha, Tipo, User_cadastra
       FROM Empresa
       WHERE email = ?`,
      [email]
    );

    if (empresas.length > 0) {
      const empresa = empresas[0];

      const senhaCorreta = await bcrypt.compare(
        senha,
        empresa.senha
      );

      if (!senhaCorreta) {
        return res.status(401).json({
          erro: "Email ou senha inválidos",
        });
      }

      let tipo;

      if (empresa.Tipo === "empresa") {
        tipo = "empresa";
      } else if (empresa.Tipo === "condominio") {
        tipo = "condominio";
      } else {
        return res.status(400).json({
          erro: "Tipo de conta inválido",
        });
      }

      
    const token = gerarToken({
      id: empresa.CNPJ,
      cnpj: empresa.CNPJ,
      papel: "empresa",
      tipo,
      podeCadastrarUsuarios:
        Boolean(empresa.User_cadastra),
    });

    return res.status(200).json({
      mensagem: "Login realizado com sucesso",
      token,
      usuario: {
        email: empresa.email,
        nome: empresa.Nome,
        cnpj: empresa.CNPJ,
        tipo,
      },
    });

    }

    // =====================================================
    // 2. VERIFICA SE É UM USUÁRIO
    // =====================================================

    const [usuarios] = await pool.query(
      `SELECT email, Nome, senha, CPF
       FROM Usuario
       WHERE email = ?`,
      [email]
    );

    if (usuarios.length > 0) {
      const usuario = usuarios[0];

      const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

      if (!senhaCorreta) {
        return res.status(401).json({ erro: "Email ou senha inválidos" });
      }

      // PK do usuário (email) e nome vão no token
      const token = gerarToken({
        id: usuario.email,
        email: usuario.email,
        nome: usuario.Nome,
        papel: "usuario",
      });

      return res.status(200).json({
        mensagem: "Login realizado com sucesso",
        token,
        usuario: {
          email: usuario.email,
          nome: usuario.Nome,
          cpf: usuario.CPF,
          tipo: "usuario",
        },
      });
    }

    return res.status(401).json({
      erro: "Email ou senha inválidos",
    });

  } catch (error) {
    console.error("Erro no login:", error);

    return res.status(500).json({
      erro: "Erro interno no servidor",
    });
  }
}

module.exports = {
  fazerLogin,
};