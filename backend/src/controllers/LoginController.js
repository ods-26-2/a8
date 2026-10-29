const pool = require("../config/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function gerarToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

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

      // Verifica a senha
      const senhaCorreta = await bcrypt.compare(
        senha,
        usuario.senha
      );

      if (!senhaCorreta) {
        return res.status(401).json({
          erro: "Email ou senha inválidos",
        });
      }

      // =====================================================
      // 3. VERIFICA SE É ADMINISTRADOR DE UMA EMPRESA
      // =====================================================

      const [empresaAdm] = await pool.query(
        `SELECT 
           ea.f_CNPJ,
           e.Nome,
           e.Tipo
         FROM Empresa_Adm ea
         INNER JOIN Empresa e
           ON ea.f_CNPJ = e.CNPJ
         WHERE ea.f_email = ?`,
        [email]
      );

      const token = gerarToken({id: usuario.CPF, papel: "usuario", tipo: "empresa_adm"});
      if (empresaAdm.length > 0) {
        return res.status(200).json({
          mensagem: "Login realizado com sucesso",
          token,
          usuario: {
            email: usuario.email,
            nome: usuario.Nome,
            cpf: usuario.CPF,
            tipo: "empresa_adm",

            empresas: empresaAdm.map((empresa) => ({
              cnpj: empresa.f_CNPJ,
              nome: empresa.Nome,
              tipo: empresa.Tipo,
            })),
          },
        });
      }

      // =====================================================
      // 4. VERIFICA SE É USUÁRIO DE UMA EMPRESA
      // =====================================================

      const [empresaUsuario] = await pool.query(
        `SELECT 
           eu.f_CNPJ,
           e.Nome,
           e.Tipo
         FROM Empresa_Usuario eu
         INNER JOIN Empresa e
           ON eu.f_CNPJ = e.CNPJ
         WHERE eu.f_email = ?`,
        [email]
      );

      const tokenUser = gerarToken({id: usuario.CPF, papel: "usuario", tipo: "empresa_usuario"});
      if (empresaUsuario.length > 0) {
        return res.status(200).json({
          mensagem: "Login realizado com sucesso",
          token: tokenUser,
          usuario: {
            email: usuario.email,
            nome: usuario.Nome,
            cpf: usuario.CPF,
            tipo: "empresa_usuario",

            empresas: empresaUsuario.map((empresa) => ({
              cnpj: empresa.f_CNPJ,
              nome: empresa.Nome,
              tipo: empresa.Tipo,
            })),
          },
        });
      }

      // =====================================================
      // 5. USUÁRIO COMUM
      // =====================================================
      const tokenComum = gerarToken({id: usuario.CPF, papel: "usuario", tipo: "usuario"});
      return res.status(200).json({
        mensagem: "Login realizado com sucesso",
        token: tokenComum,
        usuario: {
          email: usuario.email,
          nome: usuario.Nome,
          cpf: usuario.CPF,
          tipo: "usuario",
        },
      });
    }

    // =====================================================
    // 6. EMAIL NÃO ENCONTRADO
    // =====================================================

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