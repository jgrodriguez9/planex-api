const { ERROR500 } = require("../constant/errors");
const { SafetyStatusAttribute } = require("../models/case")

const getSafetyStatusList = async (req, res) =>{

    //paginate
    const pageAsNumber = Number.parseInt(req.query.page)
    const sizeAsNumber = Number.parseInt(req.query.size)

    let page = 0;
    if(!Number.isNaN(pageAsNumber) && pageAsNumber > 0){
        page = pageAsNumber;
    }

    let size = 20;
    if(!Number.isNaN(sizeAsNumber) && sizeAsNumber > 0 && sizeAsNumber < 20){
        size = sizeAsNumber;
    }

    const { count, rows } = await SafetyStatusAttribute.findAndCountAll({
        attributes: ['id','name', 'type', 'active'],
        offset: page * size,
        limit: size
    });

    return res.json({ content: rows, total_pages: Math.ceil(count / size) }) 
}

const getSafetyStatus = async (req, res) => {
    const { id } = req.params;

    try {
        const safetyStatus = await SafetyStatusAttribute.findByPk(id);
        if(!safetyStatus){
            return res.status(404).json({
                success: false,
                msg: "Can not retrieve safety status ID "+id
            })
        }

        return res.status(200).json({
            success: true,
            msg: 'success!',
            content: safetyStatus
        })
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: ERROR500,
            errors: error
        })
    }
}

const postSafetyStatus = async (req, res) =>{
    const { body } = req
    try {
        const safetyStatus = await SafetyStatusAttribute.create(body);
        return res.status(200).json({
            success: true,
            msg: 'success!',
            content: safetyStatus
        })
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: ERROR500,
            errors: error.errors
        })
    }
}

const putSafetyStatus = async (req, res) =>{
    const { id } = req.params;
    const { body } = req
    try {
        const safetyStatus = await SafetyStatusAttribute.findByPk(id);
        if(!safetyStatus){
            return res.status(404).json({
                success: false,
                msg: "Can not retrieve safety status ID "+id
            })
        }
        await safetyStatus.update(body)
        return res.status(200).json({
            success: true,
            msg: 'success!',
            content: safetyStatus
        })
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            msg: ERROR500,
            errors: error.errors
        })
    }
}

const deleteSafetyStatus = async (req, res) =>{
    const { id } = req.params;
    try {
        const safetyStatus = await SafetyStatusAttribute.findByPk(id);
        if(!safetyStatus){
            return res.status(404).json({
                success: false,
                msg: "Can not retrieve safety status ID "+id
            })
        }

        await safetyStatus.update({delete: true})
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

const getSafetyStatusActive = async(req, res) => {
    try {
        const safetyStatus = await SafetyStatusAttribute.findAll({
            where: {
                active: true
            }
        });
        

        return res.status(200).json({
            success: true,
            msg: 'success!',
            content: safetyStatus
        })
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: ERROR500,
            errors: error
        })
    }
}

module.exports = {
    getSafetyStatusList,
    getSafetyStatus,
    postSafetyStatus,
    putSafetyStatus,
    deleteSafetyStatus,
    getSafetyStatusActive
}