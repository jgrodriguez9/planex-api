const { Router } = require("express");
const { verificarToken } = require("../middlewares/verificarToken");
const { check } = require("express-validator");
const { validarCampos } = require("../middlewares/validarCampos");
const { getRoleList, getRole, postRole, putRole, deleteRole, getRolesActive } = require("../controllers/role");

const router = Router()

router.get("/", verificarToken, getRoleList)
router.get("/active", verificarToken, getRolesActive)
router.get("/:id", verificarToken, getRole)
router.post('/', verificarToken, [
    check('name', 'Campo requerido').not().isEmpty(),
    validarCampos
],postRole)
router.put('/:id',verificarToken, [
    check('name', 'Campo requerido').not().isEmpty(),
    validarCampos
], putRole)
router.delete("/:id", verificarToken, deleteRole)

module.exports = router;