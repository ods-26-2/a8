const pool = require("../config/database");

const VeiculoModel = {
    async listarDoUsuario(email){
        const [rows] = await pool.query(
            "SELECT placa, modelo, cor FROM Veiculo WHERE fkemail = ? ORDER BY modelo, placa",
            [email]
        );
        return rows;
    },

    async excluirDoUsuario(placa, email) {
      const [existe] = await pool.query(
        "SELECT 1 FROM Veiculo WHERE placa = ? AND fkemail = ?",
        [placa, email]
      );
      if (existe.length === 0) return false;

      await pool.query("DELETE FROM Veiculo WHERE placa = ? AND fkemail = ?", [placa, email]);
      return true;
    },

    async listarDaEmpresa({cnpj, email, placa}){
        const params = [cnpj];
        let sql = `
        SELECT v.placa, v.modelo, v.cor, v.fkemail AS emailUsuario, u.Nome AS nomeUsuario
        FROM Veiculo_Empresa ve
        INNER JOIN Veiculo v ON v.placa = ve.placa AND v.fkemail = ve.fkemail
        INNER JOIN Usuario u ON u.email = ve.fkemail
        WHERE ve.f_CNPJ = ?`;

        if (email){
            sql += " AND ve.fkemail = ?";
            params.push(email);
        }
        if (placa){
            sql += " AND ve.placa LIKE ?";
            params.push(`%${placa}%`);
        }
        sql += " ORDER BY v.modelo, v.placa";
        
        const [rows] = await pool.query(sql, params);
        return rows;
    },

    async cadastrarNaEmpresa({ placa, modelo, cor, email, cnpj }) {
    const conexao = await pool.getConnection();

    try {
      await conexao.beginTransaction();

      const [existe] = await conexao.query(
        "SELECT 1 FROM Veiculo WHERE placa = ? AND fkemail = ?",
        [placa, email]
      );

      if (existe.length === 0) {
        await conexao.query(
          "INSERT INTO Veiculo (placa, fkemail, modelo, cor) VALUES (?, ?, ?, ?)",
          [placa, email, modelo, cor]
        );
      }

      await conexao.query(
        "INSERT INTO Veiculo_Empresa (placa, fkemail, f_CNPJ) VALUES (?, ?, ?)",
        [placa, email, cnpj]
      );

      await conexao.commit();
    } catch (error) {
      await conexao.rollback();
      throw error;
    } finally {
      conexao.release();
    }
  },

  async desvincularDaEmpresa({ placa, email, cnpj }) {
    const [r] = await pool.query(
      "DELETE FROM Veiculo_Empresa WHERE placa = ? AND fkemail = ? AND f_CNPJ = ?",
      [placa, email, cnpj]
    );
    return r.affectedRows > 0;
  },
};

module.exports = VeiculoModel;
