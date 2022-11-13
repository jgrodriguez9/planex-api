const { ERROR500 } = require("../constant/errors");
const { ContactNumbers } = require("../models/case");

const deleteContactNumber = async (req, res) =>{
    const { id } = req.params;
    try {

        //checamos si existe el usuario
        const ctNumber = await ContactNumbers.findByPk(id);
        if(!ctNumber){
            return res.status(404).json({
                success: false,
                msg: "Not found number"
            })
        }

        await ctNumber.destroy()
        return res.status(200).json({
            success: true,
            msg: 'success'
        })
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            msg: ERROR500,
            errors: error
        })
    }
}

module.exports = {
    deleteContactNumber
}