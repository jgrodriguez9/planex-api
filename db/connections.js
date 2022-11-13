const Sequelize = require('sequelize');

const db = new Sequelize('planex-db', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql',
    //logging: false,
    port: 3306
});

module.exports = db