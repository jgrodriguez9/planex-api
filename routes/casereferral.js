const { Router } = require("express");
const { verificarToken } = require("../middlewares/verificarToken");
const { check } = require("express-validator");
const { validarCampos } = require("../middlewares/validarCampos");
const { deleteCaseReferralResource, deleteCaseReferralResourceList } = require("../controllers/casereferral");


const router = Router()

router.delete("/referrallist/:id", verificarToken ,deleteCaseReferralResourceList)
router.delete("/:id", verificarToken ,deleteCaseReferralResource)

module.exports = router;