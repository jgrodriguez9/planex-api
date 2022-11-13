const jwt = require('jsonwebtoken');
const { secret_token } = require("../common/util");

const verificarToken = ( req, res, next ) =>{
    const bearer = req.headers['authorization'];
    if(typeof bearer !==undefined){
        let token = bearer?.split(" ")[1] || ""

        jwt.verify(token, secret_token, (err, decode) => {
            if(err){
                return res.status(403).json({
                    success: false,
                    msg: "Token inválido",
                    err
                })
            }else{
                req.token = token
                next()
            }
        })
    }else{
        return res.status(403).json({
            success: false,
            msg: "Acceso denegado"
        })
    }
}

module.exports = {
    verificarToken
}