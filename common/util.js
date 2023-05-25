const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');

const secret = "CRMJAVI2022/09/23"
const secret_token = "CRMTOKENLOGIN2022/09/23"


const encrypted  = (str) => {
    let encrypted = CryptoJS.AES.encrypt(str, secret).toString();
    return encrypted;
}

const decrypted  = (str) => {
    let decrypted = CryptoJS.AES.decrypt(str, secret);
    return decrypted.toString(CryptoJS.enc.Utf8);
}

const getToken = (user) => {
    let token = jwt.sign({user}, secret_token, {
        expiresIn: '3h'
    })
    return token;
}

const getDecodeToken = (token) =>{
    let decoded = jwt.decode(token);
    return decoded;
}

const isAdministrador = (role) => {
    return role === 'ADMINISTRADOR';
}

module.exports = {
    secret_token,
    encrypted,
    decrypted,
    getToken,
    getDecodeToken,
    isAdministrador
}