const { ERROR500 } = require("../constant/errors");
const { QuestionInstruction, QuestionInstructionSubsection, QuestionInstructionSubsectionList, QuestionInstructionSection } = require("../models/questionInstructions");


const getQuestionInstructionsList = async (req, res) =>{

    //paginate
    const pageAsNumber = Number.parseInt(req.query.page)
    const sizeAsNumber = Number.parseInt(req.query.size)

    let page = 0;
    if(!Number.isNaN(pageAsNumber) && pageAsNumber > 0){
        page = pageAsNumber;
    }

    let size = 20;
    if(!Number.isNaN(sizeAsNumber) && sizeAsNumber > 0 && sizeAsNumber < 20){
        size = sizeAsNumber;
    }

    //filter
    const q = req.query.q;
    let query = "";
    if(q!==undefined){
        query = q;
    }

    const { count, rows } = await QuestionInstruction.findAndCountAll({
        attributes: ['id','name'],
        offset: page * size,
        limit: size
    });

    return res.json({ content: rows, total_pages: Math.ceil(count / size) })
}

const getQuestionInstructions = async (req, res) =>{

    const { id } = req.params;

    try {
        //checamos si existe el usuario
        const item = await QuestionInstruction.findByPk(id, {
            include: {
                model: QuestionInstructionSection,
                include: {
                    model: QuestionInstructionSubsection,
                    include: {
                        model: QuestionInstructionSubsectionList
                    }
                }
            }
        });
        if(!item){
            return res.status(404).json({
                success: false,
                msg: "No se encuentra el usuario con id "+id
            })
        }

        return res.status(200).json({
            success: true,
            msg: 'success',
            content: item
        })
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            msg: ERROR500,
            errors: error.errors
        })
    }
    
}

const postQuestionInstructions = async (req, res) => {
    const { body } = req
    try {
        const questionInstructions = await QuestionInstruction.create({name: body.name})

        body.QuestionInstructionSections.forEach(async (elemQISection) => {
            const qi_section_id = await QuestionInstructionSection.create({name: elemQISection.name, question_instruction_id: questionInstructions.id})
            await createOrUpdateQuestionInstructionSubsection(qi_section_id.id, elemQISection.QuestionInstructionSubsections)
        })
        
        return res.status(200).json({
            success: true,
            msg: 'salvado correctamente',
            content: questionInstructions
        })
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: ERROR500,
            errors: error.errors
        })
    }
}

const putQuestionInstructions = async (req, res) => {
    const { id } = req.params;
    const { body } = req;

    try {
        const questionInstructionToUpdate = await QuestionInstruction.findByPk(id);

        if(!questionInstructionToUpdate){
            return res.status(404).json({
                success: false,
                msg: "Not founded "+id
            })
        }
        console.log(JSON.stringify(body))
        await questionInstructionToUpdate.update({name: body.name})
        body.QuestionInstructionSections.forEach(async (elemQISection) => {
            let qi_section = null
            if(elemQISection.id){
                qi_section = await QuestionInstructionSection.findByPk(elemQISection.id);
                await qi_section.update({name: elemQISection.name})
            }else{
                qi_section = await QuestionInstructionSection.create({name: elemQISection.name, question_instruction_id: id})
            }       
            await createOrUpdateQuestionInstructionSubsection(qi_section.id, elemQISection.QuestionInstructionSubsections)     
        })

        return res.status(200).json({
            success: true,
            msg: 'success',
            content: questionInstructionToUpdate
        })

    } catch (error) {
        console.log(
            "-------------------------------error------------------------------"
        );
        console.log(error);
        return res.status(500).json({
            success: false,
            msg: ERROR500,
            errors: error,
        });
    }
}

const createOrUpdateQuestionInstructionSubsection = async (qiSectionId, questionInstructionSubsections) => {
    try {        
        questionInstructionSubsections.forEach(async (elemQISub) => {
            let qi_subsection = null;
            if(elemQISub.id){
                qi_subsection = await QuestionInstructionSubsection.findByPk(elemQISub.id)
                await qi_subsection.update({
                    description: elemQISub.description,
                    adorment: elemQISub. adorment,
                });
            }else{
                qi_subsection = await QuestionInstructionSubsection.create({
                    description: elemQISub.description,
                    adorment: elemQISub. adorment,
                    question_section_id: qiSectionId,
                })
            }
            
            await createOrUpdateQuestionInstructionSubsectionList(qi_subsection.id, elemQISub.QuestionInstructionSubsectionLists)            
        })
    } catch (error) {
        console.log(error)
    }
}

const createOrUpdateQuestionInstructionSubsectionList = async (qiSubsectionId, questionInstructionSubsectionList) => {
    try {
        questionInstructionSubsectionList.forEach(async (elemQISubList) => {
            let qi_subsectionList = null;
            if(elemQISubList.id){
                qi_subsectionList = await QuestionInstructionSubsectionList.findByPk(elemQISubList.id);
                await qi_subsectionList.update({
                    description: elemQISubList.description,
                    adorment: elemQISubList. adorment,
                })
            }else{
                qi_subsectionList  = await QuestionInstructionSubsectionList.create({
                    description: elemQISubList.description,
                    adorment: elemQISubList. adorment,
                    question_subsection_id: qiSubsectionId,
                })
            }                     
        })
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    getQuestionInstructionsList,
    getQuestionInstructions,
    postQuestionInstructions,
    putQuestionInstructions
}