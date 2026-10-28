
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



module.exports = {
  buscarPorEmail,
  buscarPorCPF,
  buscarCNPJPorEmailEmpresa,
  criar,
};
