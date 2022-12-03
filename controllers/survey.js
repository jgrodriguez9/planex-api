const { ERROR500 } = require("../constant/errors");
const R = require("ramda");
const {
  Survey,
  SurveyQuestion,
  SurveyQuestionAnswer,
} = require("../models/survey");
const { ValidationError } = require("sequelize");

const getSurveys = async (req, res) => {
  //paginate
  const pageAsNumber = Number.parseInt(req.query.page);
  const sizeAsNumber = Number.parseInt(req.query.size);
  let page = 0;
  if (!Number.isNaN(pageAsNumber) && pageAsNumber > 0) {
    page = pageAsNumber;
  }
  let size = 20;
  if (!Number.isNaN(sizeAsNumber) && sizeAsNumber > 0 && sizeAsNumber < 20) {
    size = sizeAsNumber;
  }

  const { count, rows } = await Survey.findAndCountAll({
    attributes: { exclude: ["description_done", "answer_done_count"] },
    include: [
      {
        model: SurveyQuestion,
        include: [{ model: SurveyQuestionAnswer, as: "suggested_answer_ids" }],
      },
    ],
    offset: page * size,
    limit: size,
  });

  var output = [];
  rows.forEach((survey) => {
    const row = {
      id: survey.id,
      title: survey.title,
      active: survey.active,
      sectionsQ: [],
      questions: [],
    };

    const bySectionsQs = R.groupBy((question) => {
      return question.is_page
        ? "sections"
        : question.page_id
        ? "sectionQ"
        : "questions";
    }, survey.SurveyQuestions);

    const sectionMap = new Map();
    bySectionsQs.sections?.forEach((section) => {
      sectionMap.set(section.id, {
        id: section.id,
        title: section.title,
        questions: [],
      });
    });

    bySectionsQs.sectionQ?.forEach((question) => {
      const q = {
        id: question.id,
        title: question.title,
        description: question.description,
        placeholder: question.placeholder,
        question_type: question.question_type,
      };
      if (
        question.question_type === "simple_choice" ||
        question.question_type === "multiple_choice"
      ) {
        q.labels =
          question.suggested_answer_ids.map((it) => ({ id: it.id, label: it.value })) ||
          [];
      }
      sectionMap.get(question.page_id).questions.push(q);
    });

    row.questions =
      bySectionsQs.questions.map((it) => ({
        id: it.id,
        title: it.title,
        description: it.description,
        placeholder: it.placeholder,
        question_type: it.question_type,
        labels:
          it.question_type === "simple_choice" ||
          it.question_type === "multiple_choice"
            ? it.suggested_answer_ids.map((it) => ({ id: it.id, label: it.value })) || []
            : [],
      })) || [];
    row.sectionsQ = Object.fromEntries(sectionMap.entries());
    output.push(row);
  });

  return res.json({ content: output, total_pages: Math.ceil(count / size) });
};

const getSurvey = async (req, res) => {
  const { id } = req.params;
  try {
    const survey = await Survey.findOne({
      where: { id: id },
      include: [
        {
          model: SurveyQuestion,
          where: { delete: false},
          include: [
            { model: SurveyQuestionAnswer, as: "suggested_answer_ids" },
          ],
        },
      ],
    });
    if (!survey) {
      return res.status(404).json({
        success: false,
        msg: "Can't retrieve survey " + id,
      });
    }

    const row = {
      id: survey.id,
      title: survey.title,
      active: survey.active,
      section: survey.section,
      sectionsQ: [],
      questions: [],
    };

    const bySectionsQs = R.groupBy((question) => {
      return question.is_page
        ? "sections"
        : question.page_id
        ? "sectionQ"
        : "questions";
    }, survey.SurveyQuestions);

    const sectionMap = new Map();
    bySectionsQs.sections?.forEach((section) => {
      sectionMap.set(section.id, {
        id: section.id,
        title: section.title,
        questions: [],
      });
    });

    bySectionsQs.sectionQ?.forEach((question) => {
      const q = {
        id: question.id,
        title: question.title,
        description: question.description,
        placeholder: question.placeholder,
        question_type: question.question_type,
      };
      if (
        question.question_type === "simple_choice" ||
        question.question_type === "multiple_choice"
      ) {
        q.labels =
          question.suggested_answer_ids.map((it) => ({ id: it.id, label: it.value })) ||
          [];
      }
      sectionMap.get(question.page_id).questions.push(q);
    });

    row.questions =
      bySectionsQs.questions.map((it) => ({
        id: it.id,
        title: it.title,
        description: it.description,
        placeholder: it.placeholder,
        question_type: it.question_type,
        labels:
          it.question_type === "simple_choice" ||
          it.question_type === "multiple_choice"
            ? it.suggested_answer_ids.map((it) => ({ id: it.id, value: it.value })) || []
            : [],
      })) || [];
    row.sectionsQ = Object.fromEntries(sectionMap.entries());

    return res.status(200).json({
      success: true,
      msg: "Success!",
      content: row,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: ERROR500,
      errors: error,
    });
  }
};

const postSurvey = async (req, res) => {
  const { body } = req;
  try {
    const survey = {
      title: body.title,
      description: body.description,
      description_done: body.description_done,
      question_count: body.questions?.length || 0,
    };

    const newSurvey = await Survey.create(survey);

    const questions = body.questions.map((it) => ({
      ...it,
      survey_id: newSurvey.getDataValue("id"),
      page_id: !it.is_page && it.page_id ? it.page_id : null,
    }));

    const newQuestions = await SurveyQuestion.bulkCreate(questions);
    let labels = [];
    newQuestions.forEach(async (question, index) => {
      if (
        !question.is_page &&
        (question.question_type === "simple_choice" ||
          question.question_type === "multiple_choice")
      ) {
        labels.push(...
          questions[index].labels?.map((it) => ({
            ...it,
            question_id: question.getDataValue("id"),
          })));
      }
    });

    if (!!labels) await SurveyQuestionAnswer.bulkCreate(labels);

    return res.status(200).json({
      success: true,
      msg: "success!",
      content: survey,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(200).json({
        success: false,
        msg: error.message,
        errors: error.errors,
      });
    }
    return res.status(500).json({
      success: false,
      msg: ERROR500,
      errors: error.errors,
    });
  }
};

const putSurvey = async (req, res) => {
  const { id } = req.params;
  const { body } = req;
  try {
    const surveyToUpdate = await Survey.findByPk(id);
    if (!surveyToUpdate) {
      return res.status(404).json({
        success: false,
        msg: "Can't retrieve survey " + id,
      });
    }
    const { title, description, description_done } = body;
    surveyToUpdate?.set({
      title: title,
      description: description,
      description_done: description_done,
    });
    await surveyToUpdate?.save();

    const questions = body.questions
      .filter((item) => !item.id)
      .map((it) => ({
        ...it,
        survey_id: id,
        page_id: !it.is_page && it.page_id ? it.page_id : null,
      }));

    const newQuestions = await SurveyQuestion.bulkCreate(questions);
    let labels = [];
    newQuestions?.forEach((question, index) => {
      if (
        !question.is_page &&
        (question.question_type === "simple_choice" ||
          question.question_type === "multiple_choice")
      ) {
        labels.push(...questions[index].labels?.map((it) => ({
          ...it,
          question_id: question.getDataValue("id"),
        })));
      }
    });
    if (!!labels) await SurveyQuestionAnswer.bulkCreate(labels);

    body.questions?.forEach(async (question) => {
      if (question.id) {
        const questionToUpdate = await SurveyQuestion.findByPk(question.id);
        questionToUpdate?.set(question);
        await questionToUpdate?.save();

        if (
          !question.is_page &&
          (question.question_type === "simple_choice" ||
            question.question_type === "multiple_choice")
        ) {
          const newLabels = question.labels
            ?.filter((item) => !item.id)
            .map((it) => ({
              ...it,
              question_id: question.id,
            }));

          if (!!newLabels) await SurveyQuestionAnswer.bulkCreate(newLabels);

          question.labels?.forEach(async (label) => {
            if (label.id) {
              const newLabel = await SurveyQuestionAnswer.findByPk(label.id);
              newLabel?.set(label);
              await newLabel?.save();
            }
          });
        }
      }
    });

    return res.status(200).json({
      success: true,
      msg: "success!",
      content: surveyToUpdate,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(200).json({
        success: false,
        msg: error.message,
        errors: error.errors,
      });
    }
    return res.status(500).json({
      success: false,
      msg: ERROR500,
      errors: error.errors,
    });
  }
};

const getQuestionPages = async (req, res) => {
  try {
    const sections = await SurveyQuestion.findAll({
      attributes: ["id", "title"],
      where: {
        is_page: true
      },
    });

    return res.status(200).json({
      success: true,
      msg: "Success!",
      content: sections,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: ERROR500,
      errors: error,
    });
  }
};

const deleteSurvey = async (req, res) => {
  const { id } = req.params;
  try {
    const survey = await Survey.findByPk(id);
    if (!survey) {
      return res.status(404).json({
        success: false,
        msg: "Can't retrieve survey " + id,
      });
    }

    await survey.update({ delete: true });
    return res.status(200).json({
      success: true,
      msg: "Success!",
    });
  } catch (error) {
    return res.status(500).json({
      msg: ERROR500,
      errors: error.errors,
    });
  }
};

const deleteSurveyQuestion = async (req, res) => {
  const { id } = req.params;
  try {
    const survey = await SurveyQuestion.findByPk(id);
    if (!survey) {
      return res.status(404).json({
        success: false,
        msg: "Can't retrieve survey " + id,
      });
    }

    await survey.update({ delete: true });
    return res.status(200).json({
      success: true,
      msg: "Success!",
    });
  } catch (error) {
    return res.status(500).json({
      msg: ERROR500,
      errors: error.errors,
    });
  } 
}

const getSurveyBySection = async (req, res) => {
  const { section } = req.params;
  try {
    const survey = await Survey.findOne({
      where: { section: section },
      include: [
        {
          model: SurveyQuestion,
          where: { delete: false},
          include: [
            { model: SurveyQuestionAnswer, as: "suggested_answer_ids" },
          ],
        },
      ],
    });
    if (!survey) {
      return res.status(404).json({
        success: false,
        msg: "Can't retrieve survey " + id,
      });
    }

    const row = {
      id: survey.id,
      title: survey.title,
      active: survey.active,
      section: survey.section,
      sectionsQ: [],
      questions: [],
    };

    const bySectionsQs = R.groupBy((question) => {
      return question.is_page
        ? "sections"
        : question.page_id
        ? "sectionQ"
        : "questions";
    }, survey.SurveyQuestions);

    const sectionMap = new Map();
    bySectionsQs.sections?.forEach((section) => {
      sectionMap.set(section.id, {
        id: section.id,
        title: section.title,
        questions: [],
      });
    });

    bySectionsQs.sectionQ?.forEach((question) => {
      const q = {
        id: question.id,
        title: question.title,
        description: question.description,
        placeholder: question.placeholder,
        question_type: question.question_type,
      };
      if (
        question.question_type === "simple_choice" ||
        question.question_type === "multiple_choice"
      ) {
        q.labels =
          question.suggested_answer_ids.map((it) => ({ id: it.id, label: it.value })) ||
          [];
      }
      sectionMap.get(question.page_id).questions.push(q);
    });

    row.questions =
      bySectionsQs.questions.map((it) => ({
        id: it.id,
        title: it.title,
        description: it.description,
        placeholder: it.placeholder,
        question_type: it.question_type,
        labels:
          it.question_type === "simple_choice" ||
          it.question_type === "multiple_choice"
            ? it.suggested_answer_ids.map((it) => ({ id: it.id, value: it.value })) || []
            : [],
      })) || [];
    row.sectionsQ = Object.fromEntries(sectionMap.entries());

    return res.status(200).json({
      success: true,
      msg: "Success!",
      content: row,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: ERROR500,
      errors: error,
    });
  }
};

module.exports = {
  getSurveys,
  getSurvey,
  postSurvey,
  putSurvey,
  deleteSurvey,
  getQuestionPages,
  deleteSurveyQuestion,
  getSurveyBySection
};
