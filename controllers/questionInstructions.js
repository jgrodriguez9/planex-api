const { QuestionInstruction } = require("../models/questionInstructions");


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

module.exports = {
    getQuestionInstructionsList
}