const jwt = require("jsonwebtoken");

function autenticar(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      erro: "Você precisa estar autenticado.",
    });
  }

  const token = authorization.split(" ")[1];

  try {
    req.auth = jwt.verify(token, process.env.JWT_SECRET);

    next();
  } catch (error) {
    console.error("Falha no JWT:", error.message);

    return res.status(401).json({
      erro: "Token inválido ou expirado. Faça login novamente.",
    });
  }
}


function apenasEmpresa(req, res, next) {
  const tipo = req.auth?.tipo;

  if (
    !["empresa", "condominio"].includes(tipo) ||
    !req.auth?.cnpj
  ) {
    return res.status(403).json({
      erro: "Somente empresas e condomínios podem cadastrar usuários.",
    });
  }

//   if (!req.auth.podeCadastrarUsuarios) {
//     return res.status(403).json({
//       erro: "Esta empresa ou condomínio não tem permissão para cadastrar usuários.",
//     });
//   }

  req.empresa = {
    cnpj: req.auth.cnpj,
    tipo,
  };

  next();
}

module.exports = {
  autenticar,
  apenasEmpresa,
};
