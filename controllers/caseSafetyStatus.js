const { ERROR500 } = require("../constant/errors");
const { SafetyStatus } = require("../models/case");

const postCaseWithSafetyStatus = async (req, res) => {
    const { body } = req
    try {
        if(body.id){
            const caseSafetyStatusToUpdate = await SafetyStatus.findByPk(body.id)
            caseSafetyStatusToUpdate?.set({
                value: body.value
            })
            caseSafetyStatusToUpdate?.save();
            return res.status(200).json({
                success: true,
                msg: 'saved!',
                content: caseSafetyStatusToUpdate
            })
        }else{
            const newCaseSafetyStatus = await SafetyStatus.create({
                value: body.value,
                CaseId: body.CaseId,
                SafetyStatusAttributeId: body.SafetyStatusAttributeId
            });
            return res.status(200).json({
                success: true,
                msg: 'saved!',
                content: newCaseSafetyStatus
            })
        }        
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: ERROR500,
            errors: error
        })
    }
}

module.exports = {
    postCaseWithSafetyStatus
}