const {verificarToken} = require('../config/token');

function autenticar(req, res, next) {
  const [tipo, token] = (req.headers.authorization || "").split(" ");

  if (tipo !== "Bearer" || !token) {
    return res.status(401).json({ erro: "Token não informado." });
  }

  try {
    const payload = verificarToken(token);
    req.auth = { id: payload.sub, papel: payload.papel };
    return next();
  } catch (error) {
    return res.status(401).json({ erro: "Sessão inválida ou expirada." });
  }
}

module.exports = autenticar;