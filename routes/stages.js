const { Router } = require("express");
const { verificarToken } = require("../middlewares/verificarToken");
const { check } = require("express-validator");
const { validarCampos } = require("../middlewares/validarCampos");
const { deleteStages, getStages, getStagesActive, getStagesList, postStages, putStages } = require("../controllers/stages");


const router = Router()

router.get("/", verificarToken, getStagesList)
router.get("/active", verificarToken, getStagesActive)
router.get("/:id", verificarToken, getStages)
router.post("/", verificarToken, [
    check('name', 'Name is required').not().isEmpty(),
    validarCampos
],postStages)
router.put("/:id", verificarToken, [
    check('name', 'Name is required').not().isEmpty(),
    validarCampos
],putStages)
router.delete("/:id", verificarToken, deleteStages)

module.exports = router;