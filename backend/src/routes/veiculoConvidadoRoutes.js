const router = require("express").Router();
const { autenticar, apenasEmpresa } = require("../middlewares/autenticar");
const VeiculoConvidadoController = require("../controllers/VeiculoConvidadoController");

router.post("/", autenticar, apenasEmpresa, VeiculoConvidadoController.cadastrar);

module.exports = router;