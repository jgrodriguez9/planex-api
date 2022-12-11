const { ERROR500 } = require("../constant/errors");
const { CaseReferralResourceList, CaseReferralResource } = require("../models/case");

const deleteCaseReferralResource = async (req, res) =>{
    const { id } = req.params;
    try {

        //checamos si existe el usuario
        const item = await CaseReferralResource.findByPk(id);
        if(!item){
            return res.status(404).json({
                success: false,
                msg: "No se encuentra el usuario con id "+id
            })
        }

        await item.destroy()
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

const deleteCaseReferralResourceList = async (req, res) =>{
    const { id } = req.params;
    try {

        //checamos si existe el usuario
        const item = await CaseReferralResourceList.findByPk(id);
        if(!item){
            return res.status(404).json({
                success: false,
                msg: "No se encuentra el usuario con id "+id
            })
        }

        await item.destroy()
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
    deleteCaseReferralResource,
    deleteCaseReferralResourceList
}