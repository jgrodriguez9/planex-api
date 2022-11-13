const { Router } = require("express");
const { verificarToken } = require("../middlewares/verificarToken");
const { getSponsorInfo } = require("../controllers/sponsorInfo");


const router = Router()

router.get("/", verificarToken, getSponsorInfo)

module.exports = router;