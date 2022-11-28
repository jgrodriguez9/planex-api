const { ERROR500 } = require("../constant/errors");
const { ReportTopConfiguration } = require("../models/case");

const getReportTopConfigurationList = async (req, res) =>{

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

    const { count, rows } = await ReportTopConfiguration.findAndCountAll({
        attributes: ['id','title', 'type', 'show'],
        offset: page * size,
        limit: size
    });

    return res.json({ content: rows, total_pages: Math.ceil(count / size) }) 
}

const getReportTopConfiguration = async (req, res) => {
    const { id } = req.params;

    try {

        //checamos si existe el usuario
        const item = await ReportTopConfiguration.findByPk(id);
        if(!item){
            return res.status(404).json({
                success: false,
                msg: "No se encuentra la entidad con id "+id
            })
        }

        return res.status(200).json({
            success: true,
            msg: 'success',
            content: item
        })
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: ERROR500,
            errors: error
        })
    }
}

const postReportTopConfiguration = async (req, res) =>{
    const { body } = req
    try {
        const item = await ReportTopConfiguration.create(body);
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

const putReportTopConfiguration = async (req, res) =>{
    const { id } = req.params;
    const { body } = req
    try {

        //checamos si existe el usuario
        const item = await ReportTopConfiguration.findByPk(id);
        if(!item){
            return res.status(404).json({
                success: false,
                msg: "No se encuentra el satges con id "+id
            })
        }
        await item.update(body)
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

const getReportTopConfigurationActive = async(req, res) => {
    try {

        //checamos si existe el usuario
        const items = await ReportTopConfiguration.findAll({
            where: {
                show: true
            }
        });
        return res.status(200).json({
            success: true,
            msg: 'success',
            content: items
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
    getReportTopConfigurationList,
    getReportTopConfiguration,
    postReportTopConfiguration,
    putReportTopConfiguration,
    getReportTopConfigurationActive
}