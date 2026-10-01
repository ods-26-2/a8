const router = require('express').Router();
const EmpresaController = require('../controllers/EmpresaController');

router.post("/", EmpresaController.cadastrar);

module.exports = router;