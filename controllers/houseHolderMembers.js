const { ERROR500 } = require("../constant/errors");
const { HouseHoldMembers } = require("../models/case");

const deleteHouseHoldMember = async (req, res) =>{
    const { id } = req.params;
    try {

        //checamos si existe el usuario
        const houseHoldMember = await HouseHoldMembers.findByPk(id);
        if(!houseHoldMember){
            return res.status(404).json({
                success: false,
                msg: "Not found number"
            })
        }

        await houseHoldMember.destroy()
        return res.status(200).json({
            success: true,
            msg: 'success'
        })
        
    } catch (error) {
        return res.status(500).json({
            msg: ERROR500,
            errors: error
        })
    }
}

module.exports  ={
    deleteHouseHoldMember
}