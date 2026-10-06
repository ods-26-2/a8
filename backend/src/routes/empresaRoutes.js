const router = require('express').Router();
const EmpresaController = require('../controllers/EmpresaController');
const autenticar = require('../middlewares/autenticar');

router.post("/", EmpresaController.cadastrar);
router.get("/me", autenticar, EmpresaController.perfil);

module.exports = router;