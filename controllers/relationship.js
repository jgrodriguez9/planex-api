const { ERROR500 } = require("../constant/errors");
const { Relationship } = require("../models/case");

const getRelationshipList = async (req, res) =>{

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

    const { count, rows } = await Relationship.findAndCountAll({
        attributes: ['id','name', 'active'],
        offset: page * size,
        limit: size
    });

    return res.json({ content: rows, total_pages: Math.ceil(count / size) }) 
}

const getRelationship = async (req, res) => {
    const { id } = req.params;

    try {

        //checamos si existe el usuario
        const item = await Relationship.findByPk(id);
        if(!item){
            return res.status(404).json({
                success: false,
                msg: "No se encuentra la relationship con id "+id
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

const postRelationship = async (req, res) =>{
    const { body } = req
    try {
        const item = await Relationship.create(body);
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

const putRelationship = async (req, res) =>{
    const { id } = req.params;
    const { body } = req
    try {

        //checamos si existe el usuario
        const item = await Relationship.findByPk(id);
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

const deleteRelationship = async (req, res) =>{
    const { id } = req.params;
    try {

        //checamos si existe el usuario
        const item = await Relationship.findByPk(id);
        if(!item){
            return res.status(404).json({
                success: false,
                msg: "No se encuentra el stages con id "+id
            })
        }

        await item.update({delete: true})
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

const getRelationshipActive = async(req, res) => {
    try {

        //checamos si existe el usuario
        const items = await Relationship.findAll({
            where: {
                active: true
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
    getRelationshipList,
    getRelationship,
    postRelationship,
    putRelationship,
    deleteRelationship,
    getRelationshipActive
}