const { Router } = require("express");
const { verificarToken } = require("../middlewares/verificarToken");
const { check } = require("express-validator");
const { validarCampos } = require("../middlewares/validarCampos");
const { deleteUser, getUser, getUserList, postUser, putUser, getUserListAll } = require('../controllers/user');

const router = Router()

router.get("/", verificarToken, getUserList)
router.get("/all", verificarToken, getUserListAll)
router.get("/:id", verificarToken, getUser)
router.post('/', verificarToken, [
    check('name', 'Campo requerido').not().isEmpty(),
    check('username', 'Campo requerido').not().isEmpty(),
    check('email', 'Campo requerido').isEmail(),
    check('password', 'Campo requerido').not().isEmpty(),
    check('role_id', 'Campo requerido').not().isEmpty(),
    validarCampos
],
postUser)
router.put('/:id',verificarToken, [
    check('name', 'Campo requerido').not().isEmpty(),
    check('username', 'Campo requerido').not().isEmpty(),
    check('email', 'Campo requerido').isEmail(),
    validarCampos
], putUser)
router.delete("/:id", verificarToken, deleteUser)

module.exports = router;