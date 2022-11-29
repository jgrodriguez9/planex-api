const express = require('express')
const cors = require('cors')
const db = require('../db/connections')

//routes
const authRoute = require('../routes/auth');
const userRoute = require('../routes/user');
const caseRoute = require('../routes/case');
const caseInfoRoute = require('../routes/case');
const sponsorInfoRoute = require('../routes/sponsorInfo');
const contactNumbersRoute = require('../routes/contactNumbers');
const houseHoldMember = require('../routes/houseHolderMembers');
const stagesRoute = require('../routes/stages');
const stagesNotes = require('../routes/stagesNotes');
const caseStages = require('../routes/caseStages');
const survey = require('../routes/survey')
const surveyUserInput = require("../routes/surveyUserInput");

class Server{

    constructor(){
        this.app = express();
        this.port = process.env.PORT || '8080';
        this.apiPath = {
          auth: "/api/auth",
          user: "/api/user",
          case: "/api/case",
          caseInfo: "/api/caseinfo",
          sponsorInfo: "/api/sponsorinfo",
          contactNumbers: "/api/contactnumbers",
          houseHoldMember: "/api/householdermember",
          stages: "/api/stages",
          stagesnotes: "/api/stagesnotes",
          casestages: "/api/casestages",
          survey: "/api/survey",
          surveyUserInput: "/api/survey/userinput",
        };

        //db
        this.dbConnection();

        //middlewares
        this.middlewares();

        //definir routes
        this.routes()
    }

    async dbConnection(){
        try {
            await db.authenticate();
            console.log('database connection success')
            
            //sync
            //await db.sync({ alter: true }) 
            //console.log('database online sync')

            // //data default
            // Role.bulkCreate(dataRole)
            // User.create({
            //     name: 'Admin',
            //     email: 'admin@admin.com',
            //     username: "admin",
            //     active: true,
            //     password: encrypted('123456')   ,
            //     role_id: 1             
            // })
        } catch (error) {
            throw new Error(error)
            
        }
    }

    middlewares(){
        //cors
        this.app.use(cors());

        //parse body
        this.app.use(express.json({limit: '10000kb'}));

        //folder public
        this.app.use(express.static('public'));
    }

    routes(){
        this.app.use(this.apiPath.auth, authRoute);
        this.app.use(this.apiPath.user, userRoute);
        this.app.use(this.apiPath.case, caseRoute);
        this.app.use(this.apiPath.caseInfo, caseInfoRoute);
        this.app.use(this.apiPath.sponsorInfo, sponsorInfoRoute);
        this.app.use(this.apiPath.contactNumbers, contactNumbersRoute);
        this.app.use(this.apiPath.houseHoldMember, houseHoldMember);
        this.app.use(this.apiPath.stages, stagesRoute);
        this.app.use(this.apiPath.stagesnotes, stagesNotes);
        this.app.use(this.apiPath.casestages, caseStages);
        this.app.use(this.apiPath.survey, survey);
        this.app.use(this.apiPath.surveyUserInput, surveyUserInput);
    }

    listen(){
        this.app.listen(this.port, () => {
            console.log(`server port ${this.port}`)
        })
    }
}

module.exports = Server;