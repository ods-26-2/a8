const VeiculoModel = require("../models/VeiculoModel");
const UsuarioModel = require("../models/UsuarioModel");

const CORES = [
  "Preto", "Branco", "Prata", "Cinza", "Vermelho",
  "Azul", "Verde", "Amarelo", "Marrom", "Laranja",
];
const PLACA_VALIDA = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/; // antiga (AAA9999) e Mercosul (AAA9A99)

const limparPlaca = (v) => String(v ?? "").replace(/[^A-Za-z0-9]/g, "").toUpperCase();

function erroInterno(res, contexto, error) {
  console.error(contexto, error);
  return res.status(500).json({ erro: "Erro interno no servidor." });
}

// ---------- Home do usuário ----------

async function listarMeus(req, res) {
  try {
    const veiculos = await VeiculoModel.listarDoUsuario(req.auth.email);
    return res.json({ veiculos });
  } catch (error) {
    return erroInterno(res, "Erro ao listar veículos:", error);
  }
}

async function excluirMeu(req, res) {
  try {
    const placa = String(req.params.placa ?? "").trim();
    const ok = await VeiculoModel.excluirDoUsuario(placa, req.auth.email);

    if (!ok) {
      console.warn("excluirMeu: veículo não encontrado", { placa, email: req.auth.email });
      return res.status(404).json({ erro: "Veículo não encontrado." });
    }
    return res.json({ mensagem: "Veículo removido." });
  } catch (error) {
    return erroInterno(res, "Erro ao excluir veículo:", error);
  }
}

// ---------- Dentro de uma empresa ----------

async function listarDaEmpresa(req, res) {
  try {
    const { cnpj, email, funcao } = req.contexto;

    const veiculos = await VeiculoModel.listarDaEmpresa({
      cnpj,
      email: funcao === "comum" ? email : null, // comum só vê os próprios
      placa: limparPlaca(req.query.placa),
    });

    return res.json({ veiculos });
  } catch (error) {
    return erroInterno(res, "Erro ao listar veículos da empresa:", error);
  }
}

async function cadastrarNaEmpresa(req, res) {
  try {
    const { cnpj, email: emailToken, funcao } = req.contexto;

    const placa = limparPlaca(req.body.placa);
    const modelo = String(req.body.modelo ?? "").trim();
    const cor = String(req.body.cor ?? "").trim();
    // comum cadastra sempre para si; empresa e adm informam o e-mail
    const email = funcao === "comum" ? emailToken : String(req.body.emailUsuario ?? "").trim();

    if (!placa || !modelo || !cor || !email) {
      return res.status(400).json({ erro: "Preencha placa, modelo, cor e e-mail." });
    }
    if (!PLACA_VALIDA.test(placa)) {
      return res.status(400).json({ erro: "Placa inválida." });
    }
    if (modelo.length < 2 || modelo.length > 60) {
      return res.status(400).json({ erro: "O modelo deve ter entre 2 e 60 caracteres." });
    }
    if (!CORES.includes(cor)) {
      return res.status(400).json({ erro: "Cor inválida." });
    }

    // Empresa/adm só cadastram para usuários vinculados a esta empresa
    if (funcao !== "comum") {
      const vinculo = await UsuarioModel.buscarVinculo(email, cnpj);
      if (!vinculo) {
        return res.status(404).json({ erro: "Esse usuário não é vinculado a esta empresa." });
      }
    }

    await VeiculoModel.cadastrarNaEmpresa({ placa, modelo, cor, email, cnpj });

    return res.status(201).json({ mensagem: "Veículo cadastrado com sucesso." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ erro: "Este veículo já está vinculado a esta empresa." });
    }
    return erroInterno(res, "Erro ao cadastrar veículo:", error);
  }
}

async function removerDaEmpresa(req, res) {
  try {
    const { cnpj, email: emailToken, funcao } = req.contexto;

    const email = funcao === "comum" ? emailToken : req.params.email;
    const ok = await VeiculoModel.desvincularDaEmpresa({
      placa: limparPlaca(req.params.placa),
      email,
      cnpj,
    });

    if (!ok) return res.status(404).json({ erro: "Veículo não encontrado nesta empresa." });
    return res.json({ mensagem: "Veículo desvinculado da empresa." });
  } catch (error) {
    return erroInterno(res, "Erro ao desvincular veículo:", error);
  }
}

module.exports = {
  listarMeus,
  excluirMeu,
  listarDaEmpresa,
  cadastrarNaEmpresa,
  removerDaEmpresa,
};