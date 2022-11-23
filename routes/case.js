const { Router } = require("express");
const { check } = require("express-validator");
const {
  getCase,
  getCaseAndStatus,
  getCaseList,
  getSearchCasesByStatus,
  postCase,
  postUploadFile,
  putCase,
  getCaseByNumero,
} = require("../controllers/case");
const { validarCampos } = require("../middlewares/validarCampos");
const { verificarToken } = require("../middlewares/verificarToken");

const router = Router();

router.get("/", verificarToken, getCaseList);
router.get("/search", verificarToken, getSearchCasesByStatus);
router.get("/totalbystatus", verificarToken, getCaseAndStatus);
router.get("/checknumero/:numero", verificarToken, getCaseByNumero);
router.post("/uploadfile", postUploadFile);
router.get("/:id", verificarToken, getCase);
router.post(
  "/",
  verificarToken,
  [check("name", "Name is required").not().isEmpty(), validarCampos],
  postCase
);
router.put(
  "/:id",
  verificarToken,
  [check("name", "Name is required").not().isEmpty(), validarCampos],
  putCase
);

module.exports = router;
