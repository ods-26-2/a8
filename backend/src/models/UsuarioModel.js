
const pool = require("../config/database");

async function buscarPorEmail(email) {
  const [rows] = await pool.query(
    "SELECT email FROM Usuario WHERE email = ?",
    [email]
  );

  return rows[0] || null;
}

async function buscarPorCPF(cpf) {
  const [rows] = await pool.query(
    "SELECT CPF FROM Usuario WHERE CPF = ?",
    [cpf]
  );

  return rows[0] || null;
}

// Busca o CNPJ da empresa autenticada
async function buscarCNPJPorEmailEmpresa(email) {
  const [rows] = await pool.query(
    "SELECT CNPJ FROM Empresa WHERE email = ?",
    [email]
  );

  return rows[0] || null;
}

async function criar({ nome, email, senha, cpf, cnpj }) {
  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();

    // Confirma que a empresa existe
    const [empresas] = await conexao.query(
      "SELECT CNPJ FROM Empresa WHERE CNPJ = ?",
      [cnpj]
    );

    if (empresas.length === 0) {
      const erro = new Error("Empresa não encontrada.");
      erro.status = 404;
      throw erro;
    }

    // Insere o usuário
    await conexao.query(
      `INSERT INTO Usuario (email, Nome, senha, CPF)
       VALUES (?, ?, ?, ?)`,
      [email, nome, senha, cpf]
    );

    // Associa o usuário à empresa
    await conexao.query(
      `INSERT INTO Empresa_Usuario (f_CNPJ, f_email)
       VALUES (?, ?)`,
      [cnpj, email]
    );

    await conexao.commit();

    return { nome, email, cpf };
  } catch (error) {
    await conexao.rollback();
    throw error;
  } finally {
    conexao.release();
  }
}


async function buscarFuncaoNaEmpresa(email, cnpj){
  const[adm] = await pool.query(
  "SELECT 1 FROM Empresa_Adm WHERE f_email = ? AND f_CNPJ = ?", 
  [email, cnpj]
  );
  if (adm.length > 0) return "adm";

  const[comum] = await pool.query(
  "SELECT 1 FROM Empresa_Usuario WHERE f_email = ? AND f_CNPJ = ?", 
  [email, cnpj]
  );
  return comum.length > 0 ? "comum" : null;
}


async function listarEmpresasDoUsuario(email) {
  const [rows] = await pool.query(
    `SELECT e.CNPJ AS cnpj, e.Nome AS nome, e.Tipo AS tipo, 'adm' AS funcao
       FROM Empresa_Adm ea
       INNER JOIN Empresa e ON e.CNPJ = ea.f_CNPJ
      WHERE ea.f_email = ?
     UNION ALL
     SELECT e.CNPJ, e.Nome, e.Tipo, 'comum'
       FROM Empresa_Usuario eu
       INNER JOIN Empresa e ON e.CNPJ = eu.f_CNPJ
      WHERE eu.f_email = ?
        AND NOT EXISTS (
          SELECT 1 FROM Empresa_Adm x
           WHERE x.f_CNPJ = eu.f_CNPJ AND x.f_email = eu.f_email
        )
     ORDER BY nome`,
    [email, email]
  );
  return rows;
}

module.exports = {
  buscarPorEmail,
  buscarPorCPF,
  buscarCNPJPorEmailEmpresa,
  criar,
  buscarFuncaoNaEmpresa,
  listarEmpresasDoUsuario,
};
