const { Router } = require("express");
const { verificarToken } = require("../middlewares/verificarToken");
const { check } = require("express-validator");
const { validarCampos } = require("../middlewares/validarCampos");
const { getNotesByIdCaseStage, postStageNotes } = require("../controllers/stagesNotes");

const router = Router()

router.get("/:id", verificarToken, getNotesByIdCaseStage)
router.post("/", verificarToken, [
    check('note', 'Note is required').not().isEmpty(),
    validarCampos
], postStageNotes)

module.exports = router;