const { Router } = require("express");
const { check } = require("express-validator");
const {
  getSurveys,
  getSurvey,
  postSurvey,
  putSurvey,
  deleteSurvey,
  getQuestionPages,
  deleteSurveyQuestion,
} = require("../controllers/survey");
const { validarCampos } = require("../middlewares/validarCampos");
const { verificarToken } = require("../middlewares/verificarToken");

const router = Router();

router.get("/", verificarToken, getSurveys);
router.get("/:id", verificarToken, getSurvey);
router.post(
  "/",
  verificarToken,
  [check("title", "Title is required").not().isEmpty(), validarCampos],
  postSurvey
);
router.put(
  "/:id",
  verificarToken,
  [check("title", "Title is required").not().isEmpty(), validarCampos],
  putSurvey
);
router.post("/sections", verificarToken, getQuestionPages);
router.delete("/surveyquestion/:id", verificarToken, deleteSurveyQuestion);
router.delete("/:id", verificarToken, deleteSurvey);

module.exports = router;
