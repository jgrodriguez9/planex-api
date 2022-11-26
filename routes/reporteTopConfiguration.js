const { Router } = require("express");
const { verificarToken } = require("../middlewares/verificarToken");
const { check } = require("express-validator");
const { validarCampos } = require("../middlewares/validarCampos");
const { getReportTopConfigurationList, getReportTopConfigurationActive, getReportTopConfiguration, postReportTopConfiguration, putReportTopConfiguration } = require("../controllers/reportTopConfiguration");

const router = Router()

router.get("/", verificarToken, getReportTopConfigurationList)
router.get("/active", verificarToken, getReportTopConfigurationActive)
router.get("/:id", verificarToken, getReportTopConfiguration)
router.post("/", verificarToken, [
    check('title', 'Title is required').not().isEmpty(),
    validarCampos
],postReportTopConfiguration)
router.put("/:id", verificarToken, [
    check('title', 'Name is required').not().isEmpty(),
    validarCampos
],putReportTopConfiguration)

module.exports = router;