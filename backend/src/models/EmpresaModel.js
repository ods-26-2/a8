const pool = require("../config/database");

const EmpresaModel = {
  async create({ cnpj, nome, email, senhaHash, tipo, userCadastra }) {
    await pool.execute(
      `INSERT INTO Empresa (CNPJ, Nome, email, senha, Tipo, User_cadastra)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [cnpj, nome, email, senhaHash, tipo, userCadastra]
    );
  },

   async findByCnpj(cnpj) {
    const [rows] = await pool.execute("SELECT CNPJ FROM Empresa WHERE CNPJ = ?", [cnpj]);
    return rows[0] || null;
  },

  async findByEmail(email) {
    const [rows] = await pool.execute("SELECT CNPJ FROM Empresa WHERE email = ?", [email]);
    return rows[0] || null;
  },
};

module.exports = EmpresaModel;