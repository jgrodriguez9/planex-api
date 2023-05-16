const { Router } = require("express");
const { verificarToken } = require("../middlewares/verificarToken");
const { check } = require("express-validator");
const { validarCampos } = require("../middlewares/validarCampos");
const { getRemindersByCase, postReminders, deleteReminders, getRemindersAll, putMarkAsReaded } = require("../controllers/reminders");


const router = Router()

router.get("/case/:id", verificarToken, getRemindersByCase)
router.get("/all", verificarToken, getRemindersAll)
router.post("/", verificarToken, postReminders)
router.delete("/:id", verificarToken, deleteReminders)
router.put("/readed/:id", verificarToken, putMarkAsReaded)

module.exports = router;