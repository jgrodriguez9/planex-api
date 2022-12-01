// Import the sequelize object on which
// we have defined model.
const sequelize = require('../db/connections')
  
// Import the user model we have defined
const Case = require('../models/case')
const Survey = require("../models/survey");
sequelize.sync() 

sequelize.sync({force:true})