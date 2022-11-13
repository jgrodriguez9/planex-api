const { ERROR500 } = require("../constant/errors");
const { CaseStages } = require("../models/case");

const postCaseWithStage = async (req, res) => {
    const { body } = req
    //console.log(body)
    try {
        if(body.id){
            const caseStageToUpdate = await CaseStages.findByPk(body.id)
            caseStageToUpdate?.set({
                checked: body.checked
            })
            caseStageToUpdate?.save();
            return res.status(200).json({
                success: true,
                msg: 'saved!',
                content: caseStageToUpdate
            })
        }else{
            const newCaseStage = await CaseStages.create({
                checked: body.checked,
                CaseId: body.CaseId,
                StageId: body.StageId
            });
            return res.status(200).json({
                success: true,
                msg: 'saved!',
                content: newCaseStage
            })
        }        
        
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
    postCaseWithStage
}