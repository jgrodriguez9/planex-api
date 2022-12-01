const { Router } = require("express");
const { check } = require("express-validator");
const {
  getSurveyUserInputByIdCase,
  postSurveyUserInputByIdCase,
} = require("../controllers/surveyUserInput");
const { validarCampos } = require("../middlewares/validarCampos");
const { verificarToken } = require("../middlewares/verificarToken");

const router = Router();

router.get("/:surveyId/:caseId", verificarToken, getSurveyUserInputByIdCase);
router.post("/",
  
  [check(["surveyId", "caseId"]).not().isEmpty(), validarCampos],
  postSurveyUserInputByIdCase
);

module.exports = router;
