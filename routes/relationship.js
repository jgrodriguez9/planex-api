const { Router } = require("express");
const { verificarToken } = require("../middlewares/verificarToken");
const { check } = require("express-validator");
const { validarCampos } = require("../middlewares/validarCampos");
const { getRelationshipList, getRelationshipActive, getRelationship, postRelationship, putRelationship, deleteRelationship } = require("../controllers/relationship");


const router = Router()

router.get("/", verificarToken, getRelationshipList)
router.get("/active", verificarToken, getRelationshipActive)
router.get("/:id", verificarToken, getRelationship)
router.post("/", verificarToken, [
    check('name', 'Name is required').not().isEmpty(),
    validarCampos
],postRelationship)
router.put("/:id", verificarToken, [
    check('name', 'Name is required').not().isEmpty(),
    validarCampos
],putRelationship)
router.delete("/:id", verificarToken, deleteRelationship)

module.exports = router;