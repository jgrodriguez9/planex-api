const { ERROR500 } = require("../constant/errors");
const { StagesNotes } = require("../models/case");

const getNotesByIdCaseStage = async (req, res) => {
    const { id } = req.params;

    try {
        const stagesNote = await StagesNotes.findAll({
            where: {
                casestages_id: id
            },
            order: [['dateAction', 'DESC']]
        })

        return res.status(200).json({
            success: true,
            msg: 'success',
            content: stagesNote
        })
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: ERROR500,
            errors: error
        })
    }
} 

const postStageNotes = async (req, res) => {
    const { body } = req
    try {
        const stageNotes = await StagesNotes.create({
            note: body.note,
            dateAction: body.dateAction,
            casestages_id: body.casestages_id
        })

        return res.status(200).json({
            success: true,
            msg: 'saved!',
            content: stageNotes
        })
    } catch (error) {
        console.log('-------------------------------error------------------------------')
        console.log(error)
        return res.status(500).json({
            success: false,
            msg: ERROR500,
            errors: error
        })
    }
}

module.exports = {
    getNotesByIdCaseStage,
    postStageNotes
}