const { DataTypes } = require("sequelize");
const db = require("../db/connections");
const { Case } = require("./case");

const Survey = db.define("Survey", {
  section: {
    type: DataTypes.STRING,
    validate: {
      isIn: [
        [
          "safety_status"
        ],
      ],
    },
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  description_done: {
    type: DataTypes.TEXT,
  },
  question_count: {
    type: DataTypes.INTEGER,
  },
  answer_count: {
    type: DataTypes.INTEGER, // "Registered"
  },
  answer_done_count: {
    type: DataTypes.INTEGER, // Attempts
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  delete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

const SurveyQuestion = db.define("SurveyQuestion", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  question_placeholder: {
    type: DataTypes.STRING,
  },
  question_type: {
    type: DataTypes.STRING,
    validate: {
      isIn: [
        [
          "simple_choice",
          "multiple_choice",
          "text_box",
          "char_box",
          "numerical_box",
          "date",
          "datetime",
        ],
      ],
    },
  },
  answer_date: {
    type: DataTypes.DATEONLY, // Correct date answer - Correct date answer for this question
  },
  is_page: {
    type: DataTypes.BOOLEAN, // Is a Page?
    defaultValue: false,
  },
  sequence: {
    type: DataTypes.INTEGER,
  },
  delete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

const SurveyQuestionAnswer = db.define("SurveyQuestionAnswer", {
  sequence: {
    type: DataTypes.INTEGER,
  },
  value: {
    type: DataTypes.CHAR, // Suggested Value
    allowNull: false,
  },
  delete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

const SurveyUserInput = db.define("SurveyUserInput", {
  state: {
    type: DataTypes.STRING,
    defaultValue: "new",
    validate: {
      isIn: [["new", "in_progress", "done"]], // Not started yet, In Progress, Completed
    },
  },
  end_datetime: {
    type: DataTypes.DATE, // End date and time
  },
  deadline: {
    type: DataTypes.DATE, // Datetime until case can open the survey and submit answers
  },
});

const SurveyUserInputLine = db.define("SurveyUserInputLine", {
  answer_type: {
    type: DataTypes.STRING,
    validate: {
      isIn: [
        [
          "text_box", // Free Text
          "char_box", // Text
          "numerical_box", // Number
          "date", // Date
          "datetime", // DateTIme
          "suggestion", // Suggestion
        ],
      ],
    },
  },
  skipped: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  value_char_box: {
    type: DataTypes.CHAR,
  },
  value_numerical_box: {
    type: DataTypes.FLOAT,
  },
  value_date: {
    type: DataTypes.DATEONLY,
  },
  value_datetime: {
    type: DataTypes.DATE,
  },
  value_text_box: {
    type: DataTypes.TEXT,
  },
});

// Sections and Questions
Survey.hasMany(SurveyQuestion, {
  foreignKey: { name: "survey_id", allowNull: false },
});
SurveyQuestion.belongsTo(Survey, {
  as: "survey",
  foreignKey: "survey_id",
});
Survey.hasMany(SurveyUserInput, {
  as: "attendees",
  foreignKey: { name: "survey_id" },
}); // User Responses
SurveyUserInput.belongsTo(Survey, { as: "survey", foreignKey: "survey_id" });

// Questions / Answers;
SurveyQuestion.hasMany(SurveyQuestionAnswer, {
  // Types of answers
  as: "suggested_answer_ids",
  foreignKey: {
    name: "question_id",
    allowNull: false,
  }, // Labels used for proposed choices: simple choice, multiple choice
});
SurveyQuestionAnswer.belongsTo(SurveyQuestion, {
  foreignKey: "question_id",
});

SurveyQuestion.hasOne(SurveyQuestion, { foreignKey: { name: "page_id" } });

SurveyQuestion.hasMany(SurveyUserInputLine, {
  // Answers
  foreignKey: { name: "question_id" },
});
SurveyUserInputLine.belongsTo(SurveyQuestion, {
  foreignKey: "question_id",
});

SurveyUserInput.hasMany(SurveyUserInputLine, {
  as: "user_input_line_ids",
  foreignKey: { name: "user_input_id", allowNull: false }, // Answers
});
SurveyUserInputLine.belongsTo(SurveyUserInput, {
  foreignKey: "user_input_id",
});

SurveyUserInput.belongsToMany(SurveyQuestion, {
  as: "predefined_question_ids",
  through: "SurveyUserInputQuestion",
}); // Predefined Questions
SurveyQuestion.belongsToMany(SurveyUserInput, {
  through: "SurveyUserInputQuestion",
});

// Suggested answer
SurveyQuestionAnswer.hasOne(SurveyUserInputLine, {
  foreignKey: { name: "suggested_answer_id" },
});
SurveyUserInputLine.belongsTo(SurveyQuestionAnswer, {
  foreignKey: "suggested_answer_id",
});

// Case User Input
Case.hasMany(SurveyUserInput, { foreignKey: { name: "case_id" } });
SurveyUserInput.belongsTo(Case, {
  foreignKey: "case_id",
});

module.exports = {
  Survey,
  SurveyQuestion,
  SurveyQuestionAnswer,
  SurveyUserInput,
  SurveyUserInputLine,
};
