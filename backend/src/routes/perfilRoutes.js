const router = require("express").Router();

const { autenticar } = require("../middlewares/autenticar");
const { buscarPerfil, atualizarPerfil } = require("../controllers/PerfilController");

router.get("/perfil", autenticar, buscarPerfil);
router.put("/perfil", autenticar, atualizarPerfil);

module.exports = router;