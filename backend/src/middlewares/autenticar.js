const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
    const [esquema, tokan] = (req.headers.authorization || "").split(" ");

    if (esquema !== "Bearer" || !tokan) {
        return res.status(401).json({ error: "Não autenticado" });
    }

    try {
    req.auth = jwt.verify(token, process.env.JWT_SECRET); // { id, papel, tipo }
    next();
  } catch {
    return res.status(401).json({ erro: "Sessão inválida ou expirada." });
  }
}

function apenasEmpresa(req, res, next) {
  if (req.auth?.tipo !== "empresa" ) {
    return res.status(403).json({ erro: "Acesso negado." });
  }
  next();
}

module.exports = { autenticar, apenasEmpresa };