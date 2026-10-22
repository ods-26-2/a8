const pool = require("../config/database");

async function buscarUsuarioPorEmail(email) {
  const [rows] = await pool.query(
    "SELECT email, Nome, senha, CPF FROM Usuario WHERE email = ?",
    [email]
  );

  return rows[0];
}

module.exports = {
  buscarUsuarioPorEmail,
};