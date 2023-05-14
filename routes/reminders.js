const { Router } = require("express");
const { verificarToken } = require("../middlewares/verificarToken");
const { check } = require("express-validator");
const { validarCampos } = require("../middlewares/validarCampos");
const { getRemindersByCase, postReminders, deleteReminders } = require("../controllers/reminders");


const router = Router()

router.get("/case/:id", verificarToken, getRemindersByCase)
router.post("/", verificarToken, postReminders)
router.delete("/:id", verificarToken, deleteReminders)

module.exports = router;