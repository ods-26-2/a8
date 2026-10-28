const express = require("express");
const router = express.Router();

const {
  autenticar,
  apenasEmpresa,
} = require("../middlewares/autenticar");

const { cadastrarUsuario } = require("../controllers/UsuarioController.js");

router.post(
  "/",
  autenticar,
  apenasEmpresa,
  cadastrarUsuario
);

module.exports = router;
