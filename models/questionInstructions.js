const { DataTypes } = require("sequelize");
const db = require("../db/connections");

const QuestionInstruction = db.define("QuestionInstruction", {
    name: {
        type: DataTypes.STRING
    },
});

const QuestionInstructionSection = db.define("QuestionInstructionSection", {
    name: {
        type: DataTypes.STRING
    },
});

const QuestionInstructionSubsection = db.define("QuestionInstructionSubsection", {
    description: {
        type: DataTypes.TEXT
    },
    adorment: {
        type: DataTypes.STRING,
        validate: {
            isIn: [
              [
                "number",
                "bullet"
              ],
            ],
        },
    }
});

const QuestionInstructionSubsectionList = db.define("QuestionInstructionSubsectionList", {
    description: {
        type: DataTypes.TEXT
    },
    adorment: {
        type: DataTypes.STRING,
        validate: {
            isIn: [
              [
                "number",
                "bullet"
              ],
            ],
        },
    }
});

QuestionInstruction.hasMany(QuestionInstructionSection, { foreignKey: { name: "question_instruction_id", allowNull: false }, onDelete: 'CASCADE', onUpdate: 'CASCADE'});
QuestionInstructionSection.belongsTo(QuestionInstruction, { foreignKey: "question_instruction_id" });

QuestionInstructionSection.hasMany(QuestionInstructionSubsection, { foreignKey: { name: "question_section_id", allowNull: false }, onDelete: 'CASCADE', onUpdate: 'CASCADE'});
QuestionInstructionSubsection.belongsTo(QuestionInstructionSection, { foreignKey: "question_section_id" });

QuestionInstructionSubsection.hasMany(QuestionInstructionSubsectionList, { foreignKey: { name: "question_subsection_id", allowNull: false }, onDelete: 'CASCADE', onUpdate: 'CASCADE'});
QuestionInstructionSubsectionList.belongsTo(QuestionInstructionSubsection, { foreignKey: "question_subsection_id" });




module.exports = {
    QuestionInstruction,
    QuestionInstructionSection,
    QuestionInstructionSubsection,
    QuestionInstructionSubsectionList
}
