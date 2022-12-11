const { Router } = require("express");
const { verificarToken } = require("../middlewares/verificarToken");
const { check } = require("express-validator");
const { validarCampos } = require("../middlewares/validarCampos");
const { getReferral, getReferralList, postReferral, putReferral, deleteReferralList, getReferralEntity } = require("../controllers/referral");


const router = Router()

router.get("/", verificarToken, getReferralList)
router.get("/entity", verificarToken ,getReferralEntity)
router.delete("/referrallist/:id", verificarToken ,deleteReferralList)
router.get("/:id", verificarToken, getReferral)
router.post("/", verificarToken, postReferral)
router.put("/:id", verificarToken ,putReferral)


module.exports = router;