const { DataTypes } = require("sequelize");
const db = require("../db/connections");
const { Case } = require("./case");
const { QuestionInstruction } = require("./questionInstructions");

const DataReport = db.define("DataReport", {
    name: {
        type: DataTypes.STRING
    },
    description: {
        type: DataTypes.TEXT
    },
    section: {
        type: DataTypes.STRING
    },
});

const Sections = db.define("Sections", {
    name: {
        type: DataTypes.STRING,
        validate: {
            isIn: [
              [
                "destination_indicator_question"
              ],
            ],
        },
    }
})


Case.hasMany(DataReport, { foreignKey: { name: "case_id", allowNull: false }, onDelete: 'CASCADE'});
DataReport.belongsTo(Case, { foreignKey: "case_id" });

Sections.hasOne(QuestionInstruction, { foreignKey: { name: "section_id", allowNull: false } });
QuestionInstruction.belongsTo(Sections, { foreignKey: "section_id" });


module.exports = {
    DataReport,
    Sections
}
