const pool = require("../config/database");

const VeiculoConvidadoModel = {
  async usuarioExiste(email) {
    const [rows] = await pool.execute("SELECT email FROM Usuario WHERE email = ?", [email]);
    return rows.length > 0;
  },

  async create({ placa, cnpj, email, dataEntrada, dataSaida }) {
    await pool.execute(
      `INSERT INTO Veiculo_Convidado (placa, f_CNPJ, fkemail, data_entrada, data_saida)
       VALUES (?, ?, ?, ?, ?)`,
      [placa, cnpj, email, dataEntrada, dataSaida]
    );
  },
};

module.exports = VeiculoConvidadoModel;