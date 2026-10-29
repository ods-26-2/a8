const express = require("express");
const router = express.Router();

const { autenticar, apenasUsuario, exigirContexto } = require("../middlewares/autenticar");
const {
  cadastrarUsuario,
  listarEmpresas,
  entrarEmpresa,
} = require("../controllers/UsuarioController");

router.get("/empresas", autenticar, apenasUsuario, listarEmpresas);
router.post("/entrar-empresa", autenticar, apenasUsuario, entrarEmpresa);

router.post("/", autenticar, exigirContexto("empresa", "adm"), cadastrarUsuario);

module.exports = router;