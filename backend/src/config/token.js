const jwt = require('jsonwebtoken');

const SEGREDO = process.env.JWT_SECRET;
if (!SEGREDO) {
  throw new Error("JWT_SECRET não definido no .env");
}

const EXPIRA_EM = process.env.JWT_EXPIRES_IN || "7d";

function gerarToken({ id, papel }) {
  return jwt.sign({ papel }, SEGREDO, {
    subject: String(id),
    expiresIn: EXPIRA_EM,
    algorithm: "HS256",
  });
}

function verificarToken(token) {
  return jwt.verify(token, SEGREDO, { algorithms: ["HS256"] });
}

module.exports = { gerarToken, verificarToken };