const { CaseInfo } = require("../models/case");

const getCaseInfo = async (req, res) =>{

    const caseInfos = await CaseInfo.findAll();
 
     return res.json({
         success: true,
         content: caseInfos
     })
}

module.exports = {
    getCaseInfo
}