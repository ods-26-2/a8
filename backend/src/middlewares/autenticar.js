const jwt = require("jsonwebtoken");

function autenticar(req, res, next) {
  const [esquema, token] = (req.headers.authorization || "").split(" ");

  if (esquema !== "Bearer" || !token) {
    return res.status(401).json({ erro: "Não autenticado." });
  }

  try {
    req.auth = jwt.verify(token, process.env.JWT_SECRET); // { id, papel, tipo }
    next();
  } catch (error) {
    console.error("Falha no JWT:", error.message);
    return res.status(401).json({ erro: "Sessão inválida ou expirada." });
  }
}

function apenasEmpresa(req, res, next) {
  if (req.auth?.papel !== "empresa") {
    return res.status(403).json({ erro: "Acesso negado." });
  }
  next();
}

module.exports = { autenticar, apenasEmpresa };