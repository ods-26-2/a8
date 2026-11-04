const router = require("express").Router();
const { autenticar, exigirContexto } = require("../middlewares/autenticar");
const VeiculoConvidadoController = require("../controllers/VeiculoConvidadoController");

router.post(
  "/",
  autenticar,
  exigirContexto("empresa", "adm", "comum"),
  VeiculoConvidadoController.cadastrar
);

module.exports = router;