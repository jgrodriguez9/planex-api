const { Router } = require("express");
const { verificarToken } = require("../middlewares/verificarToken");
const { deleteHouseHoldMember } = require("../controllers/houseHolderMembers");


const router = Router()

router.delete("/:id", verificarToken, deleteHouseHoldMember)

module.exports = router;