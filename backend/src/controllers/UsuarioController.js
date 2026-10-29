const bcrypt = require("bcrypt");
const pool = require("../config/database");
const UsuarioModel = require("../models/UsuarioModel");
const { gerarToken } = require("../utils/token");

 async function cadastrarUsuario(req, res) {
  const { nome, email, cpf, senha } = req.body;
  const cnpj = req.contexto.cnpj;

  // Validações básicas
  if (
    typeof nome !== "string" ||
    typeof email !== "string" ||
    typeof cpf !== "string" ||
    typeof senha !== "string" ||
    !nome.trim() ||
    !email.trim() ||
    !cpf ||
    !senha
  ) {
    return res.status(400).json({
      mensagem: "Preencha todos os campos corretamente.",
    });
  }

  const nomeLimpo = nome.trim();
  const emailLimpo = email.trim().toLowerCase();

  if (nomeLimpo.length < 3) {
    return res.status(400).json({
      mensagem: "O nome deve ter pelo menos 3 caracteres.",
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) {
    return res.status(400).json({
      mensagem: "Informe um e-mail válido.",
    });
    
  }

  if (!/^\d{11}$/.test(cpf)) {
    return res.status(400).json({
      mensagem: "O CPF deve conter exatamente 11 números.",
    });
  }

  if (senha.length < 8) {
    return res.status(400).json({
      mensagem: "A senha deve ter pelo menos 8 caracteres.",
    });
  }

  let conexao;
  let transacaoIniciada = false;

  try {
    conexao = await pool.getConnection();

    await conexao.beginTransaction();
    transacaoIniciada = true;

    // Confere se a empresa autenticada existe.
    const [empresas] = await conexao.execute(
      "SELECT CNPJ FROM Empresa WHERE CNPJ = ?",
      [cnpj]
    );

    if (empresas.length === 0) {
      await conexao.rollback();
      transacaoIniciada = false;

      return res.status(403).json({
        mensagem: "A empresa autenticada não foi encontrada.",
      });
    }

    // Verifica se o e-mail já está cadastrado.
    const [emailExistente] = await conexao.execute(
      "SELECT email FROM Usuario WHERE email = ?",
      [emailLimpo]
    );

    if (emailExistente.length > 0) {
      await conexao.rollback();
      transacaoIniciada = false;

      return res.status(409).json({
        mensagem: "Este e-mail já está cadastrado.",
      });
    }

    // Verifica se o CPF já está cadastrado.
    const [cpfExistente] = await conexao.execute(
      "SELECT CPF FROM Usuario WHERE CPF = ?",
      [cpf]
    );

    if (cpfExistente.length > 0) {
      await conexao.rollback();
      transacaoIniciada = false;

      return res.status(409).json({
        mensagem: "Este CPF já está cadastrado.",
      });
    }

    // Criptografa a senha antes de salvar.
    const senhaHash = await bcrypt.hash(senha, 10);

    // 1. Insere na tabela Usuario.
    await conexao.execute(
      `INSERT INTO Usuario (email, Nome, senha, CPF)
       VALUES (?, ?, ?, ?)`,
      [emailLimpo, nomeLimpo, senhaHash, cpf]
    );

    // 2. Vincula o novo usuário à empresa autenticada.
    await conexao.execute(
      `INSERT INTO Empresa_Usuario (f_CNPJ, f_email)
       VALUES (?, ?)`,
      [cnpj, emailLimpo]
    );

    // Confirma as duas operações.
    await conexao.commit();
    transacaoIniciada = false;

    return res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso!",
    });
  } catch (erro) {
    if (conexao && transacaoIniciada) {
      await conexao.rollback();
    }

    // Protege também contra duplicidade causada por
    // duas requisições simultâneas.
    if (erro.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        mensagem: "Este e-mail ou CPF já está cadastrado.",
      });
    }

    console.error("Erro ao cadastrar usuário:", erro);

    return res.status(500).json({
      mensagem: "Erro interno ao cadastrar o usuário.",
    });
  } finally {
    if (conexao) {
      conexao.release();
    }
  }
}

async function listarEmpresas(req, res){
  try {
    const empresas = await UsuarioModel.listarEmpresasDoUsuario(req.auth.email);
    return res.json({ empresas });
  }catch (error) {
    console.error("Erro ao listar empresas do usuário:", error);
    return res.status(500).json({
      mensagem: "Erro interno ao listar empresas do usuário.",
    });
  }
}

async function entrarEmpresa(req, res){
  try {
    const { cnpj } = req.body;
    if (!cnpj) {
      return res.status(400).json({erro: "Informe a empresa"});
    }

    const empresas = await UsuarioModel.listarEmpresasDoUsuario(req.auth.email);
    const empresa = empresas.find((e) => e.cnpj === cnpj);

    if (!empresa) {
      return res.status(403).json({erro: "Você não tem acesso a esta empresa"});
    }

    const token = gerarToken({
      id: req.auth.email,
      email: req.auth.email,
      nome: req.auth.nome,
      papel: "usuario",
      cnpj: empresa.cnpj,
      funcao: empresa.funcao,
    });
    return res.json({token,empresa})

  }catch (error) {
    console.error("Erro ao entrar na empresa:", error);
    return res.status(500).json({
      mensagem: "Erro interno ao entrar na empresa.",
    });
  }
}

module.exports = { cadastrarUsuario, listarEmpresas, entrarEmpresa };