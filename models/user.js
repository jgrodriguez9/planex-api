const { DataTypes } = require('sequelize');
const db = require('../db/connections');
const Role = require('./role');

const User = db.define('User', {
    name: {
        type: DataTypes.STRING
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    email: {
        type: DataTypes.STRING
    },
    password: {
        type: DataTypes.STRING
    },
    username: {
        type: DataTypes.STRING
    },
    delete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }   
});

User.belongsTo(Role, {foreignKey:{name: "role_id"}})

module.exports = User;