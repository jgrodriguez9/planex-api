const { Router } = require("express");
const { verificarToken } = require("../middlewares/verificarToken");
const { check } = require("express-validator");
const { validarCampos } = require("../middlewares/validarCampos");
const { getRemindersByCase, postReminders, putReminders, deleteReminders } = require("../controllers/reminders");


const router = Router()

router.get("/case/:id", verificarToken, getRemindersByCase)
router.post("/", verificarToken, [
    check('date', 'Name is required').not().isEmpty(),
    validarCampos
],postReminders)
router.put("/:id", verificarToken, [
    check('date', 'Name is required').not().isEmpty(),
    validarCampos
],putReminders)
router.delete("/:id", verificarToken, deleteReminders)

module.exports = router;