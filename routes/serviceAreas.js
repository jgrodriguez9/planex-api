const { Router } = require("express");
const { check } = require("express-validator");
const { getServiceAreas } = require("../controllers/serviceAreas");
const { validarCampos } = require("../middlewares/validarCampos");
const { verificarToken } = require("../middlewares/verificarToken");

const router = Router();

router.get("/", verificarToken, getServiceAreas);
// router.get("/section/:section", verificarToken, getSurveyBySection);
// router.get("/sections", verificarToken, getQuestionPages);
// router.get("/:id", verificarToken, getSurvey);
// router.post(
//   "/",
//   verificarToken,
//   [check("title", "Title is required").not().isEmpty(), validarCampos],
//   postSurvey
// );
// router.put(
//   "/:id",
//   verificarToken,
//   [check("title", "Title is required").not().isEmpty(), validarCampos],
//   putSurvey
// );
// router.delete("/surveyquestion/:id", verificarToken, deleteSurveyQuestion);
// router.delete("/:id", verificarToken, deleteSurvey);

module.exports = router;
