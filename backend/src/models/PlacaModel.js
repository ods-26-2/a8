const pool = require("../config/database");

// Consultas de placa para o consumidor do I7. Só leitura: nada é gravado.
// PROVISÓRIO: ainda não filtram por empresa (o evento do I7 não traz o CNPJ). Quando ele
// vier, acrescentar `AND f_CNPJ = ?` nas duas consultas.
const PlacaModel = {
  // A placa está vinculada a QUALQUER empresa/condomínio?
  async placaVinculadaAEmpresa(placa) {
    const [rows] = await pool.query("SELECT 1 FROM Veiculo_Empresa WHERE placa = ? LIMIT 1", [placa]);
    return rows.length > 0;
  },

  // A placa é de um convidado (de qualquer empresa) cujo período cobre o instante?
  // `instanteLocal` no formato 'YYYY-MM-DD HH:mm:ss', horário local (como o app grava).
  async convidadoNoPeriodo(placa, instanteLocal) {
    const [rows] = await pool.query(
      `SELECT 1 FROM Veiculo_Convidado
       WHERE placa = ?
         AND data_entrada <= ?
         AND (data_saida IS NULL OR data_saida >= ?)
       LIMIT 1`,
      [placa, instanteLocal, instanteLocal]
    );
    return rows.length > 0;
  },

  // A placa consta como convidado (de qualquer empresa), em qualquer período?
  // Serve para distinguir "convidado fora do período" de "placa não cadastrada".
  async convidadoCadastrado(placa) {
    const [rows] = await pool.query("SELECT 1 FROM Veiculo_Convidado WHERE placa = ? LIMIT 1", [placa]);
    return rows.length > 0;
  },
};

module.exports = PlacaModel;
