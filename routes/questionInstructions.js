const { Router } = require("express");
const { verificarToken } = require("../middlewares/verificarToken");
const { check } = require("express-validator");
const { validarCampos } = require("../middlewares/validarCampos");
const { getQuestionInstructionsList } = require("../controllers/questionInstructions");

const router = Router()

router.get("/", verificarToken, getQuestionInstructionsList)

module.exports = router;