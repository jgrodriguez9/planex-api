const { ServiceAreas } = require("../models/serviceAreas");

const getServiceAreas = async (req, res) => {
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
  
    const { count, rows } = await ServiceAreas.findAndCountAll({
      offset: page * size,
      limit: size,
    });
  
    var output = [];
  
    return res.json({ content: output, total_pages: Math.ceil(count / size) });
  };


  module.exports = {
    getServiceAreas
}