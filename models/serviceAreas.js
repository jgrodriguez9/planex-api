const { DataTypes } = require("sequelize");
const db = require("../db/connections");

const ServiceAreas = db.define("ServiceAreas", {
    domain: {
        type: DataTypes.STRING
    },
    goals:{
        type: DataTypes.STRING
    }
});

const AssistanceProvided = db.define("AssistanceProvided", {
    discussed: {
        type: DataTypes.BOOLEAN
    },
    educated:{
        type: DataTypes.BOOLEAN
    },
    referred:{
        type: DataTypes.BOOLEAN
    },
    monitored:{
        type: DataTypes.BOOLEAN
    },
    providedDirectly:{
        type: DataTypes.BOOLEAN
    },
    other:{
        type: DataTypes.BOOLEAN
    }
});

const Narrative = db.define("Narrative", {
    title: {
        type: DataTypes.STRING
    },
    description:{
        type: DataTypes.TEXT
    }
});

const GoalsAchieved = db.define("GoalsAchieved", {
    yes: {
        type: DataTypes.BOOLEAN
    },
    no:{
        type: DataTypes.BOOLEAN
    },
    inProgress:{
        type: DataTypes.BOOLEAN
    },
    na:{
        type: DataTypes.BOOLEAN
    }
});

const OptionsNarrative = db.define("OptionsNarrative", {
    description:{
        type: DataTypes.TEXT
    }
});


module.exports = {
    ServiceAreas
  };