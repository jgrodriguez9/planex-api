const { ERROR500 } = require("../constant/errors");
const { DataReport, Sections } = require("../models/dataReport");

const getDataReport = async (req, res) =>{
    const { id } = req.params;
    try {
        const item = await DataReport.findByPk(id, {
            attributes: ["id", "name"],
        });
        if(!item){
            return res.status(404).json({
                success: false,
                msg: "No se encuentra el usuario con id "+id
            })
        }

        return res.status(200).json({
            success: true,
            msg: 'success',
            content: item
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

const postDataReport = async (req, res) => {
    const { body } = req
    try {
        const item = await DataReport.create(body)
        
        return res.status(200).json({
            success: true,
            msg: 'salvado correctamente',
            content: item
        })
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: ERROR500,
            errors: error.errors
        })
    }
}

const getSections = async (req, res) => {
    const items = await Sections.findAll();
    return res.status(200).json({
        success: true,
        msg: 'success',
        content: items
    })
}

const getDataReportBySection = async (req, res) => {
    const { section } = req.params;
    try {
        const item = await DataReport.findOne({
            where: {section: section},
        });
        return res.status(200).json({
            success: true,
            msg: 'success',
            content: item
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: ERROR500,
            errors: error.errors
        })
    }
    
}

module.exports = {
    getDataReport,
    postDataReport,
    getSections,
    getDataReportBySection
}