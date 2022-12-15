const { Router } = require("express");
const { verificarToken } = require("../middlewares/verificarToken");
const { check } = require("express-validator");
const { validarCampos } = require("../middlewares/validarCampos");
const { getDataReport, postDataReport, getSections } = require("../controllers/dataReport");

const router = Router()

router.get("/sections", verificarToken, getSections)
router.get("/:id", verificarToken, getDataReport)
router.post("/", verificarToken, [
    check('name', 'Name is required').not().isEmpty(),
    validarCampos
],postDataReport);

module.exports = router;