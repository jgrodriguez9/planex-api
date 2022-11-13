const { Router } = require('express');
const { check } = require('express-validator');
const { getUserLogued, login } = require('../controllers/auth');
const { validarCampos }  = require('../middlewares/validarCampos');
const { verificarToken } = require('../middlewares/verificarToken');

const router = Router()


router.post('/login', [
    check('username', 'Campo requerido').not().isEmpty(),
    check('password', 'Campo requerido').not().isEmpty(),
    validarCampos
],
login)
router.get('/loguedUser', verificarToken, getUserLogued)

module.exports = router;