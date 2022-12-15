const { Router } = require("express");
const { verificarToken } = require("../middlewares/verificarToken");
const { check } = require("express-validator");
const { validarCampos } = require("../middlewares/validarCampos");
const { getQuestionInstructionsList, postQuestionInstructions, getQuestionInstructions, putQuestionInstructions, getQuestionInstructionsBySection } = require("../controllers/questionInstructions");

const router = Router()

router.get("/", verificarToken, getQuestionInstructionsList)
router.get("/section/:id", verificarToken, getQuestionInstructionsBySection)
router.get("/:id", verificarToken, getQuestionInstructions)
router.post("/", verificarToken, [
    check('name', 'Name is required').not().isEmpty(),
    validarCampos
],postQuestionInstructions)
router.put("/:id", verificarToken, [
    check('name', 'Name is required').not().isEmpty(),
    validarCampos
],putQuestionInstructions)

module.exports = router;