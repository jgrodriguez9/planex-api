const { ERROR500 } = require("../constant/errors");
const { Stages } = require("../models/case")

const getStagesList = async (req, res) =>{

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

    const { count, rows } = await Stages.findAndCountAll({
        attributes: ['id','name', 'active'],
        offset: page * size,
        limit: size
    });

    return res.json({ content: rows, total_pages: Math.ceil(count / size) }) 
}

const getStages = async (req, res) => {
    const { id } = req.params;

    try {

        //checamos si existe el usuario
        const stages = await Stages.findByPk(id);
        if(!stages){
            return res.status(404).json({
                success: false,
                msg: "No se encuentra el stage con id "+id
            })
        }

        return res.status(200).json({
            success: true,
            msg: 'success',
            content: stages
        })
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: ERROR500,
            errors: error
        })
    }
}

const postStages = async (req, res) =>{
    const { body } = req
    try {
        const stage = await Stages.create(body);
        return res.status(200).json({
            success: true,
            msg: 'salvado correctamente',
            content: stage
        })
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: ERROR500,
            errors: error.errors
        })
    }
}

const putStages = async (req, res) =>{
    const { id } = req.params;
    const { body } = req
    try {

        //checamos si existe el usuario
        const stages = await Stages.findByPk(id);
        if(!stages){
            return res.status(404).json({
                success: false,
                msg: "No se encuentra el satges con id "+id
            })
        }
        await stages.update(body)
        return res.status(200).json({
            success: true,
            msg: 'success',
            content: stages
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

const deleteStages = async (req, res) =>{
    const { id } = req.params;
    try {

        //checamos si existe el usuario
        const stages = await Stages.findByPk(id);
        if(!stages){
            return res.status(404).json({
                success: false,
                msg: "No se encuentra el stages con id "+id
            })
        }

        await stages.update({delete: true})
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

const getStagesActive = async(req, res) => {
    try {

        //checamos si existe el usuario
        const stages = await Stages.findAll({
            where: {
                active: true
            }
        });
        

        return res.status(200).json({
            success: true,
            msg: 'success',
            content: stages
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
    getStagesList,
    getStages,
    postStages,
    putStages,
    deleteStages,
    getStagesActive
}