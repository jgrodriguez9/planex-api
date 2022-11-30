const { Op } = require("sequelize");
const { ERROR500 } = require("../constant/errors");
const R = require("ramda");
const moment = require("moment");
const { camelCase, isArray } = require("lodash");
const {
  SurveyUserInput,
  SurveyUserInputLine,
  Survey,
  SurveyQuestionAnswer,
  SurveyQuestion,
} = require("../models/survey");

const getSurveyUserInputByIdCase = async (req, res) => {
  const { surveyId, caseId } = req.params;
  const surveyWhereQuery = {
    [Op.and]: {
      "$SurveyUserInput.survey_id$":
        isNaN(surveyId) && surveyId === "all"
          ? {
              [Op.not]: null,
            }
          : { [Op.eq]: surveyId },
      "$SurveyUserInput.case_id$": caseId,
      "$SurveyUserInput.state$": {
        [Op.eq]: "done",
      },
    },
  };
  try {
    const answers = await SurveyUserInput.findAll({
      include: [
        {
          model: Survey,
          as: "survey",
          include: [
            {
              model: SurveyQuestion,
              include: [
                { model: SurveyQuestionAnswer, as: "suggested_answer_ids" },
              ],
            },
          ],
        },
        {
          model: SurveyUserInputLine,
          as: "user_input_line_ids",
          include: [
            {
              model: SurveyQuestionAnswer,
            },
          ],
        },
      ],
      where: surveyWhereQuery,
    });

    if (!answers) {
      return res.status(404).json({
        success: false,
        msg:
          "Can't retrieve answer with survey id: " +
          surveyId +
          " or case id: " +
          caseId,
      });
    }

    let output = [];
    answers.forEach((answer) => {
      const row = {
        id: answer.id,
        state: answer.state,
        end_datetime: answer.end_datetime,
        deadline: answer.deadline,
        caseId: answer.case_id,
        survey: {
          id: answer.survey.id,
          title: answer.survey.title,
          active: answer.survey.active,
          sectionsQ: [],
          questions: [],
        },
      };
      const bySectionsQs = R.groupBy((question) => {
        return question.is_page
          ? "sections"
          : question.page_id
          ? "sectionQ"
          : "questions";
      }, answer.survey.SurveyQuestions);

      const sectionMap = new Map();
      bySectionsQs.sections?.forEach((section) => {
        sectionMap.set(section.id, {
          id: section.id,
          title: section.title,
          questions: [],
        });
      });

      bySectionsQs.sectionQ?.forEach((question) => {
        const isSuggestion =
          (question.question_type === "simple_choice" ||
            question.question_type === "multiple_choice") ??
          false;
        const q = {
          id: question.id,
          title: question.title,
          description: question.description,
          placeholder: question.placeholder,
          question_type: question.question_type,
        };
        if (isSuggestion) {
          q.labels =
            question.suggested_answer_ids.map((it) => ({ label: it.value })) ||
            [];
        }
        q.answer = getSurveyUserInputByIdCase(
          isSuggestion ? "suggestion" : question.question_type,
          answer.user_input_line_ids
        );
        sectionMap.get(question.page_id).questions.push(q);
      });

      row.survey.questions =
        bySectionsQs.questions.map((it) => ({
          id: it.id,
          title: it.title,
          description: it.description,
          placeholder: it.placeholder,
          question_type: it.question_type,
          labels:
            it.question_type === "simple_choice" ||
            it.question_type === "multiple_choice"
              ? it.suggested_answer_ids.map((it) => ({ label: it.value })) || []
              : [],
          answers: getUserInputLinesByType(
            it.question_type === "simple_choice" ||
              it.question_type === "multiple_choice"
              ? "suggestion"
              : it.question_type,
            answer.user_input_line_ids
          ),
        })) || [];
      row.survey.sectionsQ = Object.fromEntries(sectionMap.entries());
      output.push(row);
    });

    return res.status(200).json({
      success: true,
      msg: "success",
      content: output,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: ERROR500,
      errors: error,
    });
  }
};

const postSurveyUserInputByIdCase = async (req, res) => {
  const { body } = req;
  try {
    const { id, ...data } = body;
    let userInputToCreateOrUpdate = null;
    if (id !== undefined || id != "null")
      userInputToCreateOrUpdate = await SurveyUserInput.findByPk(id);

    if (!userInputToCreateOrUpdate) {
      userInputToCreateOrUpdate = await SurveyUserInput.create({
        end_datetime: data.end_datetime ?? moment.now(),
        survey_id: data.surveyId,
        case_id: data.caseId,
      });
    } else {
      userInputToCreateOrUpdate?.set({
        state: data.state,
        deadline:
          data.state === "in_progress"
            ? data.deadline
            : userInputToCreateOrUpdate.end_datetime,
      });
      userInputToCreateOrUpdate = await userInputToCreateOrUpdate?.save();
    }

    let answers = [];
    if (userInputToCreateOrUpdate.state === "in_progress") {
      const questions = await questionsBySurveyNotPage(
        userInputToCreateOrUpdate.survey_id
      );
      questions?.forEach(async (it) => {
        let row = {
          answer_type:
            it.question_type === "simple_choice" ||
            it.question_type === "multiple_choice"
              ? "suggestion"
              : it.question_type,
          user_input_id: userInputToCreateOrUpdate.id,
          question_id: it.id,
        };
        const fieldValue = `answer_${it.id}_value_${row.answer_type}`;
        switch (row.answer_type) {
          case "text_box": // Free Text
            row.value_text_box = fieldValue;
          case "char_box": // Text
            row.value_char_box = fieldValue;
            break;
          case "numerical_box": // Number
            row.value_numerical_box = Number.parseFloat(fieldValue) || 0;
            break;
          case "date": // Date
            row.value_date = moment(fieldValue, "YYYY-MM-DD").format(
              "DD-MM-YYYY"
            );
            break;
          case "datetime": // DateTime
            row.value_datetime = moment(fieldValue);
          default:
            toDeleteSAnswerIds(it.id, userInputToCreateOrUpdate.id);
            const suggestions = it.suggested_answer_ids?.filter((label) => {
              return (
                data[`answer_${it.id}_suggestion_${camelCase(label.value)}`] !=
                  undefined &&
                data[`answer_${it.id}_suggestion_${camelCase(label.value)}`] ===
                  true
              );
            });
            row = suggestions?.map((suggestion) => ({
              ...row,
              suggested_answer_id: suggestion.id,
            }));
            break;
        }
        answers = isArray(row) ? row : [row];
      });
      
      if (!!answers) {
        const newAnswers = await SurveyUserInputLine.bulkCreate(answers);
        userInputToCreateOrUpdate?.set({
          state: "done",
        });
        userInputToCreateOrUpdate = await userInputToCreateOrUpdate?.save();
        return res.status(200).json({
          success: true,
          msg: "Saved!",
          content: {
            userInput: userInputToCreateOrUpdate,
            answers: newAnswers,
          },
        });
      } else {
        return res.status(200).json({
          success: true,
          msg: "Can't update answers!",
          content: answers,
        });
      }
    } else {
      const msg =
        userInputToCreateOrUpdate.state == "done"
          ? "Your answers was finnish for this case! Please, change status to update answers"
          : "Answers to complete! Complete yours answers for this case";
      return res.status(200).json({
        success: true,
        msg: msg,
        content: userInputToCreateOrUpdate,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
      errors: error,
    });
  }
};

const getUserInputLinesByType = (answer_type, answers) => {
  if (answer_type === "suggestion") {
    return (
      answers
        ?.filter((item) => {
          return item.answer_type === "suggestion";
        })
        .map((it) => ({
          id: it.id,
          answer_type: it.answer_type,
          answer_values: [it.SurveyQuestionAnswer].map((sAnswer_it) => ({
            id: sAnswer_it.id,
            value: sAnswer_it.value,
          })),
        })) || []
    );
  } else {
    const field = `value_${answer_type}`;
    const sUserInputLines = answers?.filter((item) => {
      return item.answer_type === answer_type;
    });
    return (
      (sUserInputLines.length === 1 ? sUserInputLines : sUserInputLines[0]).map(
        (it) => ({
          id: it.id,
          answer_type: it.answer_type,
          value: it[field] ?? "",
        })
      ) || []
    );
  }
};

const questionsBySurveyNotPage = async (surveyId) => {
  const questions = await SurveyQuestion.findAll({
    where: {
      survey_id: surveyId,
      is_page: false,
    },
    include: [{ model: SurveyQuestionAnswer, as: "suggested_answer_ids" }],
  });
  return questions || [];
};

const toDeleteSAnswerIds = async (question_id, user_input_id) => {
  const sAnswerIdsToUpdate = await SurveyUserInputLine.findAll({
    where: {
      question_id: question_id,
      user_input_id: user_input_id,
      suggested_answer_id: {
        [Op.not]: null,
      },
    },
  });
  sAnswerIdsToUpdate?.forEach(async (it) => {
    await it.update({ delete: true });
  });
};

module.exports = {
  getSurveyUserInputByIdCase,
  postSurveyUserInputByIdCase,
};
