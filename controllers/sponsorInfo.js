const { SponsorInfo } =  require("../models/case");

const getSponsorInfo = async (req, res) =>{

    const items = await SponsorInfo.findAll();
 
     return res.json({
         success: true,
         content: items
     })
}

module.exports = {
    getSponsorInfo
}