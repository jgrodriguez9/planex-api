const Sequelize = require('sequelize');

/*const db = new Sequelize('sqlite::memory:', {
  // Choose one of the logging options
  logging: (...msg) => console.log(msg)
});*/
const db = new Sequelize({
  dialect: "sqlite",
  storage: "planex-db.sqlite",
});

/*const db = new Sequelize('planex-db', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql',
    //logging: false,
    port: 3306
});*/

module.exports = db