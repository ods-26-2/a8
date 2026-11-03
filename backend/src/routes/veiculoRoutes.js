const router = require("express").Router();

const {
  autenticar,
  apenasUsuario,
  exigirContexto,
  exigirPermissaoCadastro,
} = require("../middlewares/autenticar");
const VeiculoController = require("../controllers/VeiculoController");

const dentroDaEmpresa = exigirContexto("empresa", "adm", "comum");

// Home do usuário (todos os carros dele)
router.get("/meus", autenticar, apenasUsuario, VeiculoController.listarMeus);
router.delete("/meus/:placa", autenticar, apenasUsuario, VeiculoController.excluirMeu);

// Veículos vinculados a uma empresa
router.get("/empresa", autenticar, dentroDaEmpresa, VeiculoController.listarDaEmpresa);
router.post("/empresa", autenticar, dentroDaEmpresa, exigirPermissaoCadastro, VeiculoController.cadastrarNaEmpresa);
router.delete("/empresa/:placa/:email", autenticar, dentroDaEmpresa, VeiculoController.removerDaEmpresa);

module.exports = router;