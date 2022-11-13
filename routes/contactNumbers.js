const { Router } = require("express");
const { verificarToken } = require("../middlewares/verificarToken");
const { check } = require("express-validator");
const { deleteContactNumber } = require("../controllers/contactNumbers");

const router = Router()

router.delete("/:id", verificarToken, deleteContactNumber)

module.exports = router;