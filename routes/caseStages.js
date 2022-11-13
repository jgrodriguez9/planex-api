const { Router } = require("express");
const { verificarToken } = require("../middlewares/verificarToken");
const { postCaseWithStage } = require("../controllers/caseStages");


const router = Router()

router.post("/", verificarToken, postCaseWithStage)

module.exports = router;