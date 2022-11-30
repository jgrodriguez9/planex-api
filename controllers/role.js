const { Op } = require("sequelize");
const { encrypted } = require("../common/util");
const { ERROR500 } = require("../constant/errors");
const Role = require("../models/role");
const User = require("../models/user");



const getRoleList = async (req, res) =>{

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

    //filter
    const q = req.query.q;
    let query = "";
    if(q!==undefined){
        query = q;
    }

    const { count, rows } = await Role.findAndCountAll({
        attributes: ['id','name'],
        offset: page * size,
        limit: size
    });

    return res.json({ content: rows, total_pages: Math.ceil(count / size) })
}

const getRole = async (req, res) => {
    const { id } = req.params;

    try {
        //checamos si existe el usuario
        const user = await Role.findByPk(id);
        if(!user){
            return res.status(404).json({
                success: false,
                msg: "No se encuentra el usuario con id "+id
            })
        }

        return res.status(200).json({
            success: true,
            msg: 'success',
            content: user
        })
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: ERROR500,
            errors: error.errors
        })
    }
}

const postRole = async (req, res) =>{
    const { body } = req
    try {
        const role = await Role.create(body);
        return res.status(200).json({
            success: true,
            msg: 'Salvado correctamente',
            content: role
        })
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: ERROR500,
            errors: error.errors
        })
    }
}

const putRole = async (req, res) =>{
    const { id } = req.params;
    const { body } = req
    try {

        //checamos si existe el usuario
        const role = await Role.findByPk(id);
        if(!role){
            return res.status(404).json({
                success: false,
                msg: "No se encuentra el usuario con id "+id
            })
        }

        await role.update(body)
        return res.status(200).json({
            success: true,
            msg: 'success',
            content: user
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

const deleteRole = async (req, res) =>{
    const { id } = req.params;
    try {

        //checamos si existe el usuario
        const role = await Role.findByPk(id);
        if(!role){
            return res.status(404).json({
                success: false,
                msg: "No se encuentra el usuario con id "+id
            })
        }

        await role.update({delete: true})
        return res.status(200).json({
            success: true,
            msg: 'success'
        })
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            msg: ERROR500,
            errors: error.errors
        })
    }
}

const getRolesActive = async(req, res) => {
    try {
        const roles = await Role.findAll({
            where: {
                delete: false
            }
        });

        return res.status(200).json({
            success: true,
            msg: 'success',
            content: roles
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
    getRoleList,
    getRole,
    postRole,
    putRole,
    deleteRole,
    getRolesActive
}