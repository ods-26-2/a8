const jwt = require("jsonwebtoken");
const UsuarioModel = require("../models/UsuarioModel");

function autenticar(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ erro: "Você precisa estar autenticado." });
  }

  const token = authorization.split(" ")[1];

  try {
    req.auth = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    console.error("Falha no JWT:", error.message);
    return res.status(401).json({ erro: "Token inválido ou expirado. Faça login novamente." });
  }
}

function apenasUsuario(req, res, next) {
  if (req.auth?.papel !== "usuario" || !req.auth?.email) {
    return res.status(403).json({ erro: "Área exclusiva de usuários." });
  }
  next();
}

function exigirContexto(...funcoesPermitidas) {
  return async (req, res, next) => {
    try {
      const { papel, cnpj, email } = req.auth;
      let contexto = null;

      if (papel === "empresa" && cnpj) {
        contexto = { cnpj, email: null, funcao: "empresa" };
      } else if (papel === "usuario" && cnpj && email) {
        // não confia só no token: reconfere o vínculo no banco
        const funcao = await UsuarioModel.buscarFuncaoNaEmpresa(email, cnpj);
        if (funcao) contexto = { cnpj, email, funcao };
      }

      if (!contexto) {
        return res.status(403).json({ erro: "Selecione uma empresa para continuar." });
      }
      if (!funcoesPermitidas.includes(contexto.funcao)) {
        return res.status(403).json({ erro: "Você não tem permissão para esta ação." });
      }

      req.contexto = contexto;
      next();
    } catch (error) {
      console.error("Erro ao validar contexto:", error);
      return res.status(500).json({ erro: "Erro interno no servidor." });
    }
  };
}

module.exports = { autenticar, apenasUsuario, exigirContexto };