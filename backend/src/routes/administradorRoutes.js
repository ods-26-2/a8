const router = require("express").Router();

const { autenticar, exigirContexto } = require("../middlewares/autenticar");
const AdministradorController = require("../controllers/AdministradorController");

// Só a conta da empresa/condomínio (função "empresa") pode cadastrar administradores
const apenasEmpresa = exigirContexto("empresa");

router.post("/", autenticar, apenasEmpresa, AdministradorController.cadastrar);

module.exports = router;
