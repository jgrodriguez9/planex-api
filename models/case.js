const moment = require("moment");
const { DataTypes } = require("sequelize");
const db = require("../db/connections");

const Case = db.define("Case", {
    aNumber: {
        type: DataTypes.STRING
    },
    name: {
        type: DataTypes.STRING
    },
    lastName: {
        type: DataTypes.STRING
    },
    aka: {
        type: DataTypes.STRING
    },
    birthday: {
        type: DataTypes.DATEONLY
    },
    placeBirth: {
        type: DataTypes.STRING
    },
    gender: {
        type: DataTypes.STRING
    } 
})

const CaseInfo = db.define("CaseInfo", {
  caseManager: {
    type: DataTypes.STRING,
  },
  contactInformation: {
    type: DataTypes.STRING,
  },
  dateComplete: {
    type: DataTypes.DATEONLY,
  },
  dateRelease: {
    type: DataTypes.DATEONLY,
  },
  dateAcceptance: {
    type: DataTypes.DATEONLY,
  },
  dateClosure: {
    type: DataTypes.DATEONLY,
  },
  postReleaseAgency: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.ENUM("active", "maintenance", "close"),
  },
});

const SponsorInfo = db.define("SponsorInfo", {
    age: {
        type: DataTypes.STRING
    },   
    homeAddress: {
        type: DataTypes.STRING
    },
    nationality: {
        type: DataTypes.STRING
    },
    relationship: {
        type: DataTypes.STRING
    },
    gender: {
        type: DataTypes.STRING
    },
    name: {
        type: DataTypes.STRING
    },
    lastName: {
        type: DataTypes.STRING
    }
})

const HouseHoldMembers = db.define("HouseHoldMembers", {
  age: {
    type: DataTypes.STRING,
  },
  name: {
    type: DataTypes.STRING,
  },
  nacionality: {
    type: DataTypes.STRING,
  },
  relationshipSponsor: {
    type: DataTypes.STRING,
  },
  gender: {
    type: DataTypes.STRING,
  },
});

const ContactNumbers = db.define("ContactNumbers", {
  number: {
    type: DataTypes.STRING,
  },
});

const Stages = db.define("Stages", {
  name: {
    type: DataTypes.STRING,
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  delete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

const StagesNotes = db.define("StagesNotes", {
  note: {
    type: DataTypes.STRING,
  },
  dateAction: {
    type: DataTypes.DATE,
  },
});

const CaseStages = db.define("CaseStages", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  checked: {
    type: DataTypes.BOOLEAN,
  },
});

const PRSOnly = db.define("PRSOnly", {
  criminalHistory: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  gangInvolvement: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  behavioralProblems: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  abuseHistory: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  traumaHistory: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  mentalHealth: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  suicidalBehaviors: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  substanceAbuse: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  cognitiveDevelopmentalDelays: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  lackFormalEducation: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  medicalCondition: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  disability: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  pregnantParentingTeen: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  lackPriorRelationshipSponsor: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  sponsorLackKnowledge: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  traffickingConcern: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  sponsorConcerns: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  prsDiscretionary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  categorySponsorship: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  other: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

const PRSAfter = db.define("PRSAfter", {
  tvpraTraffickingConcerns: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  tvpraSponsorConcerns: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  tvpraDisability: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  tvpraAbuseHistory: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

const SafetyStatusAttribute = db.define("SafetyStatusAttribute", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  type: {
    type: DataTypes.STRING,
    defaultValue: "BOOLEAN",
    validate:{
      isOne:["BOOLEAN", "STRING"]
    },
    active:{
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  },
});

const SafetyStatus = db.define("SafetyStatus", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  value: {
    type: DataTypes.STRING,
  },
});

const Relationship = db.define('Relationship', {
    name: {
      type: DataTypes.STRING
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    delete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
})

Case.hasOne(CaseInfo, { foreignKey: { name: "case_id", allowNull: false } });
CaseInfo.belongsTo(Case, { foreignKey: "case_id" });

Case.hasOne(SponsorInfo, { foreignKey: { name: "case_id", allowNull: false } });
SponsorInfo.belongsTo(Case, { foreignKey: "case_id" });

Case.hasMany(HouseHoldMembers, {
  foreignKey: { name: "case_id", allowNull: false },
});
HouseHoldMembers.belongsTo(Case, { foreignKey: "case_id" });

SponsorInfo.hasMany(ContactNumbers, {
  foreignKey: { name: "sponsor_id", allowNull: false },
});
ContactNumbers.belongsTo(SponsorInfo, { foreignKey: "sponsor_id" });

Case.belongsToMany(Stages, { through: CaseStages });
Stages.belongsToMany(Case, { through: CaseStages });

CaseStages.hasMany(StagesNotes, {
  foreignKey: { name: "casestages_id", allowNull: false },
});
StagesNotes.belongsTo(CaseStages, { foreignKey: "casestages_id" });

Case.hasOne(PRSOnly, { foreignKey: "case_id" });
PRSOnly.belongsTo(Case, { foreignKey: "case_id" });

Case.hasOne(PRSAfter, { foreignKey: "case_id" });
PRSAfter.belongsTo(Case, { foreignKey: "case_id" });

Case.belongsToMany(SafetyStatusAttribute, { through: SafetyStatus });
SafetyStatusAttribute.belongsToMany(Case, { through: SafetyStatus });

Relationship.hasMany(HouseHoldMembers, {foreignKey: 'relationship_id'})
HouseHoldMembers.belongsTo(Relationship, {foreignKey: 'relationship_id'})

ReportTopConfiguration.hasMany(ReportTopConfiguration, {foreignKey: 'report_top_configuration_id'})
ReportTopConfiguration.belongsTo(ReportTopConfiguration, {foreignKey: 'report_top_configuration_id'})

Case.belongsToMany(ReportTopConfiguration, { through: CaseReportTopConfiguration, foreignKey: 'case_id' });
ReportTopConfiguration.belongsToMany(Case, { through: CaseReportTopConfiguration, foreignKey: 'report_id' });



module.exports = {
  Case,
  CaseInfo,
  SponsorInfo,
  HouseHoldMembers,
  ContactNumbers,
  Stages,
  StagesNotes,
  CaseStages,
  PRSAfter,
  PRSOnly,
  SafetyStatusAttribute,
  SafetyStatus,
  Relationship
};
