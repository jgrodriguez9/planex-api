const { Op } = require("sequelize");
const { decrypted, getDecodeToken, getToken } = require("../common/util");
const { ERROR500 } = require("../constant/errors");
const Role = require("../models/role");
const User = require("../models/user");

const login = async (req, res) =>{
    const { body } = req
    try {
        //checamos si existe algun user en la BD
        //con el mismo email o username
        const existUser = await User.findOne({
            include: Role,
            where: {
                [Op.or]: {
                    username: body.username,
                    email: body.username
                }
            }
        })
        if(!existUser){
            return res.status(404).json({
                success: false,
                msg: 'No existe usuario'
            })
        }

        //obtenemos el password y lo comparamos
        let passDecrypt = decrypted(existUser.get("password"))
        if(passDecrypt !== body.password){
            return res.status(404).json({
                success: false,
                msg: 'La constraseña no coincide'
            })
        }

        //obtenemos el jwt
        let token = getToken(existUser)
        return res.status(200).json({
            success: true,
            token: token
        })
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: ERROR500,
            errors: error.errors
        })
    }
}

const getUserLogued = (req, res) =>{
    const { token } = req

    try {
        const authData = getDecodeToken(token)
        return res.status(200).json({
            success: true,
            content: authData
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
    login,
    getUserLogued
}