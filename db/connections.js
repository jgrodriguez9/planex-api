const Sequelize = require('sequelize');

/*const db = new Sequelize('sqlite::memory:', {
  // Choose one of the logging options
  logging: (...msg) => console.log(msg)
});*/

const db = new Sequelize('plannex', 'userplannexdb', 'userplannexdb2022', {
    host: 'localhost',
    dialect: 'mysql',
    //logging: false,
    port: 3306
});

module.exports = db
