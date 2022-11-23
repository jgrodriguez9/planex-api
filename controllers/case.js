const { Op } = require("sequelize");
const moment = require("moment");
const multer = require("multer");
const { ERROR500 } = require("../constant/errors");
const {
  Case,
  CaseInfo,
  ContactNumbers,
  HouseHoldMembers,
  PRSAfter,
  PRSOnly,
  SponsorInfo,
  Stages,
} = require("../models/case");
const fs = require("fs");
const { parse } = require("../helpers/pdfToJson");

const upload = multer({
  fileFilter: (req, file, cb) => {
    if (file.mimetype == "application/pdf") {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("INVALID_TYPE"));
    }
  },
  limits: {
	  fileSize: 1024 * 1024,
  }
}).single("file");

const getCaseList = async (req, res) => {
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

  //filter
  const statusQuery = req.query.status;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  console.log(statusQuery);

  let whereQuery = {
    status:
      statusQuery !== "null" && statusQuery !== undefined
        ? statusQuery
        : {
            [Op.or]: [
              { [Op.eq]: "active" },
              { [Op.eq]: "close" },
              { [Op.eq]: "maintenance" },
            ],
          },
    dateAcceptance:
      startDate !== "null" && statusQuery !== undefined
        ? {
            [Op.gte]: startDate,
            [Op.lte]: endDate,
          }
        : { [Op.not]: null },
  };

  const { count, rows } = await Case.findAndCountAll({
    attributes: ["id", "name", "aNumber", "placeBirth"],
    include: [
      {
        model: CaseInfo,
        where: whereQuery,
      },
    ],
    offset: page * size,
    limit: size,
  });

  return res.json({ content: rows, total_pages: Math.ceil(count / size) });
};

const getCase = async (req, res) => {
  const { id } = req.params;

  try {
    //checamos si existe el usuario
    const caseObj = await Case.findByPk(id, {
      include: [
        CaseInfo,
        {
          model: SponsorInfo,
          include: [ContactNumbers],
        },
        HouseHoldMembers,
        Stages,
        PRSAfter,
        PRSOnly,
      ],
    });
    if (!caseObj) {
      return res.status(404).json({
        success: false,
        msg: "No se encuentra el case con id " + id,
      });
    }

    return res.status(200).json({
      success: true,
      msg: "success",
      content: caseObj,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: ERROR500,
      errors: error,
    });
  }
};

const postCase = async (req, res) =>{
    const { body } = req
    try {
        const caseObj = {
            aNumber: body.aNumber,
            name: body.name,
            lastName: body.lastName,
            aka: body.aka,
            birthday: body.birthday,
            placeBirth: body.placeBirth,
            gender: body.gender
        }
        const newCase = await Case.create(caseObj);
        const caseId = newCase.getDataValue('id');

    const { caseInfo } = body;
    caseInfo.case_id = caseId;
    await CaseInfo.create(caseInfo);

    const { sponsorInfo } = body;
    sponsorInfo.case_id = caseId;
    const spId = await SponsorInfo.create(sponsorInfo);

    const contactNumbers = body.sponsorInfo.contactNumbers.map((it) => ({
      ...it,
      sponsor_id: spId.getDataValue("id"),
    }));
    await ContactNumbers.bulkCreate(contactNumbers);

    const houseHoldMembers = body.houseHoldMembers.map((it) => ({
      ...it,
      case_id: caseId,
    }));
    await HouseHoldMembers.bulkCreate(houseHoldMembers);

    //newCase.createCaseInfo()
    return res.status(200).json({
      success: true,
      msg: "saved!",
      content: newCase,
    });
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
};

const putCase = async (req, res) => {
  const { id } = req.params;
  const { body } = req;

  try {
    const caseToUpdate = await Case.findByPk(id);
    const { name, aNumber, birthday, gender, placeBirth } = body;
    caseToUpdate?.set({
      name: name,
      aNumber: aNumber,
      birthday: birthday,
      gender: gender,
      placeBirth: placeBirth,
    });
    await caseToUpdate?.save();

    const { caseInfo } = body;
    if (caseInfo && caseInfo.id) {
      const caseInfoToUpdate = await CaseInfo.findByPk(caseInfo.id);
      caseInfoToUpdate?.set(caseInfo);
      await caseInfoToUpdate?.save();
    } else {
      caseInfo.case_id = id;
      await CaseInfo.create(caseInfo);
    }

    const { sponsorInfo } = body;
    if (sponsorInfo && sponsorInfo.id) {
      const sponsorInfoToUpdate = await SponsorInfo.findByPk(sponsorInfo.id);
      sponsorInfoToUpdate?.set(sponsorInfo);
      await sponsorInfoToUpdate?.save();

      const newNumbers = sponsorInfo.contactNumbers
        .filter((item) => !item.id)
        .map((it) => ({ ...it, sponsor_id: sponsorInfo.id }));
      await ContactNumbers.bulkCreate(newNumbers);
      sponsorInfo.contactNumbers.forEach(async (element) => {
        if (element.id) {
          const ctNumber = await ContactNumbers.findByPk(element.id);
          ctNumber?.set(element);
          await ctNumber?.save();
        }
      });
    } else {
      sponsorInfo.case_id = id;
      const sp = await SponsorInfo.create(sponsorInfo);
      const newNumbers = sponsorInfo.contactNumbers
        .filter((item) => !item.id)
        .map((it) => ({ ...it, sponsor_id: sp.getDataValue("id") }));
      await ContactNumbers.bulkCreate(newNumbers);
    }
    //householdermembers
    const newHouseHoldMembers = body.houseHoldMembers
      .filter((item) => !item.id)
      .map((it) => ({ ...it, case_id: id }));
    await HouseHoldMembers.bulkCreate(newHouseHoldMembers);
    body.houseHoldMembers.forEach(async (elem) => {
      if (elem.id) {
        const houseHold = await HouseHoldMembers.findByPk(elem.id);
        houseHold?.set(elem);
        await houseHold?.save();
      }
    });

    //prsOnly and prsafter
    const {
      reasonReferral: { prsOnly, prsAfter },
    } = body;
    console.log(prsOnly);
    console.log(prsAfter);
    if (prsOnly && prsOnly.id) {
      const prsOnlyToUpdate = await PRSOnly.findByPk(prsOnly.id);
      prsOnlyToUpdate?.set(prsOnly);
      await prsOnlyToUpdate?.save();
    } else {
      prsOnly.case_id = id;
      await PRSOnly.create(prsOnly);
    }
    if (prsAfter && prsAfter.id) {
      const prsAfterToUpdate = await PRSAfter.findByPk(prsAfter.id);
      prsAfterToUpdate?.set(prsAfter);
      await prsAfterToUpdate?.save();
    } else {
      prsAfter.case_id = id;
      await PRSAfter.create(prsAfter);
    }

    return res.status(200).json({
      success: true,
      msg: "updated!",
      content: caseToUpdate,
    });
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
};

const getSearchCasesByStatus = async (req, res) => {
  //flter to search
  const statusType = req.query.status;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  const { count, rows } = await Case.findAndCountAll({
    attributes: ["id", "name", "aNumber", "placeBirth"],
    include: [
      {
        model: CaseInfo,
        where: {
          status: statusType,
          dateAcceptance: {
            [Op.gte]: startDate,
            [Op.lte]: endDate,
          },
        },
      },
    ],
  });

  return res.json({ content: rows, total: count });
};

const getCaseAndStatus = async (req, res) => {
  const cases = await Case.findAll({
    include: [CaseInfo],
  });

  const statusActive = cases.filter(
    (c) => c.getDataValue("CaseInfo").status === "active"
  ).length;
  const statusMaintenance = cases.filter(
    (c) => c.getDataValue("CaseInfo").status === "maintenance"
  ).length;
  const statusClose = cases.filter(
    (c) => c.getDataValue("CaseInfo").status === "close"
  ).length;

  return res.json({
    content: {
      statusActive: statusActive,
      statusMaintenance: statusMaintenance,
      statusClose: statusClose,
    },
  });
};

const postUploadFile = async (req, res) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        msg: err.message,
        code: err.code,
        errors: err,
      });
    } else if (err) {
      if (err.message === "FILE_MISSING" || err.message === "INVALID_TYPE")
        return res.status(400).json({
          success: false,
          code: err.message,
          errors: err,
        });
      else {
        return res.status(500).json({
          success: false,
          msg: ERROR500,
          code: "GENERIC_ERROR",
          errors: err,
        });
      }
    }
	try{
		const result = { done: {}, draft: {} };
		await parse(req.file.buffer).then((data) => {
		  const fields = data.summary.fields;
		  result.done = {
			name: fields[0].value ? fields[0].value + " " + fields[1].value : "",
			aka: fields[2].value ?? "",
			aNumber: fields[6].value ?? null,
			birthday: moment(fields[4].value, "MM/DD/YYYY").format("YYYY-MM-DD") ?? null,
			placeBirth: fields[10].value ?? "",
			gender: fields[5].value ?? "M",
			sponsorInfo: {
				name: '',
				age: '',
				relationship: '',
				nationality: '',
				contactNumbers: [],
				homeAddress: '',
				gender: 'Male'
            },
            caseInfo: {
            dateAcceptance: null,
            dateRelease: null,
            dateComplete: null,
            dateClosure: null,
            postReleaseAgency: '',
            caseManager: '',
            contactInformation: '',
            status: 'active'
        },
        houseHoldMembers: [
            {
                name: '',
                nacionality: '',
                age: '',
                gender: 'Male',
                relationshipSponsor: '',
                relationshipMinor: '',
            }
        ],
        reasonReferral: {
            prsOnly: {
                criminalHistory: false,
                gangInvolvement: false,
                behavioralProblems: false,
                abuseHistory: false,
                traumaHistory: false,
                mentalHealth: false,
                suicidalBehaviors: false,
                substanceAbuse: false,
                cognitiveDevelopmentalDelays: false,
                lackFormalEducation: false,
                medicalCondition: false,
                disability: false,
                pregnantParentingTeen: false,
                lackPriorRelationshipSponsor: false,
                sponsorLackKnowledge: false,
                traffickingConcern: false,
                sponsorConcerns: false,
                prsDiscretionary: false,
                categorySponsorship: false,
                other: false,
            },
            prsAfter: {
                tvpraTraffickingConcerns: false,
                tvpraSponsorConcerns: false,
                tvpraDisability: false,
                tvpraAbuseHistory: false,
            }		
		   }
		  };
		  data.summary.fields.forEach((el) => {
			console.log(el);
		  });
		});
		console.log(result);

		return res.status(200).json({
		  success: true,
		  msg: "success!",
		  content: result,
		});
	}catch(err){
	  return res.status(500).json({
        success: false,
        msg: ERROR500,
		code: "GENERIC_ERROR",
        errors: err,
      });
	}
  });
};

const getCaseByNumero = async (req, res) => {
    console.log('-------------entro----------') 
    const { numero } = req.params;
    console.log(numero)

  try {
    //checamos si existe el usuario
    const caseObj = await Case.findOne({
      where: { aNumber: numero },
      attributes: ["id", "name", "aNumber", "placeBirth"],
    });
    if (!caseObj) {
      return res.status(404).json({
        success: false,
        msg: "No se encuentra el case con id " + id,
      });
    }

    return res.status(200).json({
      success: true,
      msg: "success",
      content: caseObj,
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
  getCaseList,
  getCase,
  postCase,
  putCase,
  getSearchCasesByStatus,
  getCaseAndStatus,
  postUploadFile,
  getCaseByNumero,
};
