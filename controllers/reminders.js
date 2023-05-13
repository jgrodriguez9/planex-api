const { ERROR500 } = require("../constant/errors");
const { Reminders } = require("../models/case");

const postReminders = async (req, res) =>{
    const { body } = req
    try {
        const reminder = await Reminders.create(body);
        return res.status(200).json({
            success: true,
            msg: 'salvado correctamente',
            content: reminder
        })
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: ERROR500,
            errors: error.errors
        })
    }
}

const putReminders = async (req, res) =>{
    const { id } = req.params;
    const { body } = req
    try {

        //checamos si existe el usuario
        const reminder = await Reminders.findByPk(id);
        if(!reminder){
            return res.status(404).json({
                success: false,
                msg: "No se encuentra el satges con id "+id
            })
        }
        await reminder.update(body)
        return res.status(200).json({
            success: true,
            msg: 'success',
            content: reminder
        })
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: ERROR500,
            errors: error.errors
        })
    }
}

const getRemindersByCase = async(req, res) => {
    const { id } = req.params;
    try {
        const reminders = await Reminders.findAll({
            where: {
                case_id: id
            }
        });        

        return res.status(200).json({
            success: true,
            msg: 'success',
            content: reminders
        })
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: ERROR500,
            errors: error
        })
    }
}

const deleteReminders = async (req, res) =>{
    const { id } = req.params;
    try {

        //checamos si existe el usuario
        const reminder = await Reminders.findByPk(id);
        if(!reminder){
            return res.status(404).json({
                success: false,
                msg: "No se encuentra el reminder con id "+id
            })
        }

        await reminder.destroy();
        return res.status(200).json({
            success: true,
            msg: 'success'
        })
        
    } catch (error) {
        return res.status(500).json({
            msg: ERROR500,
            errors: error.errors
        })
    }
}

module.exports = {
    postReminders,
    putReminders,
    getRemindersByCase,
    deleteReminders
}