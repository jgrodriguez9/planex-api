const { DataTypes } = require('sequelize');
const db = require('../db/connections');

const Role = db.define("Role", {
    name: {
        type: DataTypes.STRING
    },   
    delete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
})

module.exports = Role;