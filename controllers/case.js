const { Op } = require("sequelize");
const moment = require("moment");
const multer = require("multer");
const R = require("ramda");
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
  CaseReferralResource,
  CaseReferralResourceList,
  ReportTopConfiguration,
  Referral,
  ReferralList,
} = require("../models/case");
const fs = require("fs");
const { parse } = require("../helpers/pdfToJson");
const { SurveyUserInput, SurveyQuestionAnswer, SurveyUserInputLine, Survey, SurveyQuestion } = require("../models/survey");
const { addSurveyUserInputByIdCase } = require("./surveyUserInput");
const { DataReport, Sections } = require("../models/dataReport");
const { QuestionInstruction, QuestionInstructionSection, QuestionInstructionSubsection, QuestionInstructionSubsectionList } = require("../models/questionInstructions");
const { serviceAreasData } = require("../data/roles");

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
    order: [[CaseInfo, 'dateAcceptance', 'DESC']],
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
        PRSAfter,
        PRSOnly,
        {
          model: SurveyUserInput,
          include:{
            model: SurveyUserInputLine, 
            as: 'user_input_line_ids',
            include: {model: SurveyQuestionAnswer}
          }          
        },
      ],
    });
    if (!caseObj) {
      return res.status(404).json({
        success: false,
        msg: "No se encuentra el case con id " + id,
      });
    }
    const caseDB = await caseObj.get();

    //checamos si ya tenemos unheader
    let objheader = null;
    const existHeader = await DataReport.findOne({
      where: {
        section: 'header',
        case_id: id
      }
    });
    if(existHeader){
      objheader = {
        id: existHeader.id,
        data: JSON.parse(existHeader.description),
      }
    }else{
      const headerTopActive = await ReportTopConfiguration.findAll({
        where: {
            show: true
        }
      });
      objheader = {
        id: null,
        data: {
          prs_case_type: headerTopActive.filter(it=>it.type==='prs_case_type'),
          prs_visit_type: headerTopActive.filter(it=>it.type==='prs_visit_type'),
          prs_level: headerTopActive.filter(it=>it.type==='prs_level'),
          case_closing_summary: headerTopActive.filter(it=>it.type==='case_closing_summary')
        }      
      }
    }
    //end checamos si ya tenemos unheader
    
    //Safety status
    let safetyStatusObj = null;
    const existSStatus = await DataReport.findOne({
      where: {
        section: 'safety_status',
        case_id: id
      }
    });
    if(existSStatus){
      safetyStatusObj = {
        id:existSStatus.id,
        data: JSON.parse(existSStatus.description)
      }
    }else{
      const safetyStatus  = await getSurveyBySection('safety_status')
      safetyStatusObj = {
        id:null,
        data: safetyStatus
      }
    }
    //end safety status
    
    //referrals &resources
    let referralResourceObj = null;
    const existReferralResources = await DataReport.findOne({
      where: {
        section: 'referrals_resource',
        case_id: id
      }
    });
    if(existReferralResources){
      referralResourceObj = {
        id:existReferralResources.id,
        data: JSON.parse(existReferralResources.description)
      }
    }else{
      const referralResource = await Referral.findAll({
        include: [ReferralList]
      });
      referralResourceObj = {
        id:null,
        data: referralResource
      }
    }
    //end referrals &resources
    
    //case close program
    let caseCloseProgramObj = null;
    const existCaseCloseP = await DataReport.findOne({
      where: {
        section: 'case_closure_program_outcomes_indicators',
        case_id: id
      }
    });
    if(existCaseCloseP){
      caseCloseProgramObj = {
        id:existCaseCloseP.id,
        data: JSON.parse(existCaseCloseP.description)
      }
    }else{
      const caseCloseProgram  = await getSurveyBySection('case_closure_program_outcomes_indicators')
      caseCloseProgramObj = {
        id:null,
        data: caseCloseProgram
      }
    }
    //end case close program

    //destinationIndicators
    let destinationIndicatorsObj = null;
    const existDestinationIndicators = await DataReport.findOne({
      where: {
        section: 'destination_indicator_question',
        case_id: id
      }
    });
    if(existDestinationIndicators){
      destinationIndicatorsObj = {
        id: existDestinationIndicators.id,
        data: JSON.parse(existDestinationIndicators.description)
      }
    }else{
      const destinationIndicators = await getQuestionInstructionsBySectionName('destination_indicator_question');
      destinationIndicatorsObj = {
        id: null,
        data: destinationIndicators
      }
    }
    //end destinationIndicators
    

    //service Instructions
    let serviceIndicatorsObj = null;
    const existServiceInstrctions = await DataReport.findOne({
      where: {
        section: 'service_areas_supplemental_instructions',
        case_id: id
      }
    });
    if(existServiceInstrctions){
      serviceIndicatorsObj = {
        id: existServiceInstrctions.id,
        data: JSON.parse(existServiceInstrctions.description)
      }
    }else{
      const serviceIndicators = await getQuestionInstructionsBySectionName('service_areas_supplemental_instructions');
      serviceIndicatorsObj = {
        id: null,
        data: serviceIndicators
      }
    }
    //end service Indicators

    //service areas
    let serviceAreasObj = null;
    const existServiceAreas = await DataReport.findOne({
      where: {
        section: 'service_areas',
        case_id: id
      }
    });
    if(existServiceAreas){
      serviceAreasObj = {
        id: existServiceAreas.id,
        data: JSON.parse(existServiceAreas.description)
      }
    }else{
      //const serviceIndicators = await getQuestionInstructionsBySectionName('service_areas_supplemental_instructions');
      serviceAreasObj = {
        id: null,
        data: serviceAreasData
      }
    }
    //end service areas

    const myCase = {
      ...caseDB,
      Header: objheader,
      SafetyStatus: safetyStatusObj,
      ReferralResource: referralResourceObj,
      CaseCloseProgram: caseCloseProgramObj,
      DestinationIndicator: destinationIndicatorsObj,
      ServiceInstructions: serviceIndicatorsObj,
      ServiceAreas: serviceAreasObj
    }

    return res.status(200).json({
      success: true,
      msg: "success",
      content: myCase,
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      msg: ERROR500,
      errors: error,
    });
  }
};

const getCleanCase = async (req, res) => {
  const { id } = req.params;

  try {
    const headerTopActive = await ReportTopConfiguration.findAll({
      where: {
          show: true
      }
    });
    const objheader = {
      id: null,
      data: {
        prs_case_type: headerTopActive.filter(it=>it.type==='prs_case_type'),
        prs_visit_type: headerTopActive.filter(it=>it.type==='prs_visit_type'),
        prs_level: headerTopActive.filter(it=>it.type==='prs_level'),
        case_closing_summary: headerTopActive.filter(it=>it.type==='case_closing_summary')
      }      
    }
    const safetyStatus  = await getSurveyBySection('safety_status')
    const safetyStatusObj = {
      id:null,
      data: safetyStatus
    }
    const referralResource = await Referral.findAll({
      include: [ReferralList]
    });
    const referralResourceObj = {
      id:null,
      data: referralResource
    }
    const caseCloseProgram  = await getSurveyBySection('case_closure_program_outcomes_indicators')
    const caseCloseProgramObj = {
      id:null,
      data: caseCloseProgram
    }
    const destinationIndicators = await getQuestionInstructionsBySectionName('destination_indicator_question');
    const destinationIndicatorsObj = {
      id: null,
      data: destinationIndicators
    }
    const serviceIndicators = await getQuestionInstructionsBySectionName('service_areas_supplemental_instructions');
    const serviceIndicatorsObj = {
      id: null,
      data: serviceIndicators
    }

    const myCase = {
      Header: objheader,
      SafetyStatus: safetyStatusObj,
      ReferralResource: referralResourceObj,
      CaseCloseProgram: caseCloseProgramObj,
      DestinationIndicator: destinationIndicatorsObj,
      ServiceInstructions: serviceIndicatorsObj
    }

    return res.status(200).json({
      success: true,
      msg: "success",
      content: myCase,
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

    //prsOnly and prsafter
    const { reasonReferral: { prsOnly, prsAfter } } = body;
    await PRSOnly.bulkCreate(prsOnly);
    await PRSAfter.bulkCreate(prsAfter);

    //update Header
    const { Header } = body;
    await createOrUpdateSection(Header, 'header', caseId)
    //end update Header

    //safety status report
    const { SafetyStatus } = body;
    await createOrUpdateSection(SafetyStatus, 'safety_status', caseId)

    //referral & resources
    const { ReferralResource } = body;
    await createOrUpdateSection(ReferralResource, 'referrals_resource', caseId)

    //case close program
    const { CaseCloseProgram } = body;
    await createOrUpdateSection(CaseCloseProgram, 'case_closure_program_outcomes_indicators', caseId)

    //destination of indicator
    const { DestinationIndicator } = body;
    await createOrUpdateSection(DestinationIndicator, 'destination_indicator_question', caseId)

    //destination of indicator
    const { ServiceInstructions } = body;
    await createOrUpdateSection(ServiceInstructions, 'service_areas_supplemental_instructions', caseId)

    //services areas
    const { ServiceAreas } = body;
    await createOrUpdateSection(ServiceAreas, 'service_areas', caseId)

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

    //update Header
    const { Header } = body;
    await createOrUpdateSection(Header, 'header', caseToUpdate.id)
    //end update Header

    //safety status report
    const { SafetyStatus } = body;
    await createOrUpdateSection(SafetyStatus, 'safety_status', caseToUpdate.id)

    //referral & resources
    const { ReferralResource } = body;
    await createOrUpdateSection(ReferralResource, 'referrals_resource', caseToUpdate.id)

    //case close program
    const { CaseCloseProgram } = body;
    await createOrUpdateSection(CaseCloseProgram, 'case_closure_program_outcomes_indicators', caseToUpdate.id)

    //destination of indicator
    const { DestinationIndicator } = body;
    await createOrUpdateSection(DestinationIndicator, 'destination_indicator_question', caseToUpdate.id)

    //destination of indicator
    const { ServiceInstructions } = body;
    await createOrUpdateSection(ServiceInstructions, 'service_areas_supplemental_instructions', caseToUpdate.id)

    //services areas
    const { ServiceAreas } = body;
    await createOrUpdateSection(ServiceAreas, 'service_areas', caseToUpdate.id)

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
            //console.log(data)
            
            const fields = data.summary.fields;

            const sponsorInfoPrimary = data?.profile?.find(item => {
                return item.label.includes('Demographic Information')
            })
            //console.log(JSON.stringify(sponsorInfoPrimary))
            const sponsorRelationship = data?.profile?.find(item => {
                return item.label.includes('Relationship to UC')
            })
            const sponsorContacts = data?.profile?.find(item => {
                return item.label.includes('Contact Information')
            })
            let homeAddress = ''
            let contactNumbers = []

            if(sponsorInfoPrimary && sponsorInfoPrimary !== undefined){
                const dateBirthSponsor = sponsorInfoPrimary?.fields[2]?.value ?? ''
                if(dateBirthSponsor){
                    const _mBirthay = moment(dateBirthSponsor, "MM/DD/YYYY")
                    age = moment().diff(_mBirthay, 'years')
                }    
                
            }
            if(sponsorContacts && sponsorContacts !== undefined){
                const phone1 = sponsorContacts?.fields.find(item=>item.name.replaceAll(" ", "")==='PrimaryPhone:')
                if(phone1?.value) contactNumbers.push({number: phone1.value})
                const phone2 = sponsorContacts?.fields.find(item=>item.name.replaceAll(" ", "")==='BackupPhone#:')
                if(phone2?.value) contactNumbers.push({number: phone2.value})

                const streetA = sponsorContacts?.fields[0]?.value ?? ''
                const cityA = sponsorContacts?.fields[1]?.value ?? ''
                const stateA = sponsorContacts?.fields[2]?.value ?? ''
                const countryA = sponsorContacts?.fields[4]?.value ?? ''
                const zipCodeA = sponsorContacts?.fields[3]?.value ?? ''
                homeAddress = `${streetA} ${cityA} ${stateA} ${countryA} ${zipCodeA}`
            }

            //house hold members
            let houseHoldMembers = []
            const houseHoldM = data?.profile?.find(item => {
                return item.label.includes('Household Information:')
            })
            console.log(JSON.stringify(houseHoldM))
            if(houseHoldM && houseHoldM !== undefined){
                if(houseHoldM?.rows?.firstName[0].length > 0){
                    houseHoldMembers = houseHoldM?.rows?.firstName[0].map((item, index) => (
                        {
                            name: `${item} ${houseHoldM?.rows?.lastName[0][index]}`,
                            nacionality: '',
                            age: houseHoldM?.rows?.currentAge[0][index],
                            gender: houseHoldM?.rows?.gender[0][index],
                            relationshipSponsor: houseHoldM?.rows?.relationshipToSponsor[0][index],                           
                        }
                    ))
                }                
            }

            result.done = {
                name: fields[0]?.value ?? '' ,
                lastName: fields[1]?.value ?? "",
                aka: fields[2]?.value ?? "",
                aNumber: fields[6]?.value ?? null,
                birthday: moment(fields[4]?.value, "MM/DD/YYYY").format("YYYY-MM-DD") ?? null,
                placeBirth: fields[10]?.value ?? "",
                gender: (fields[5]?.value ==  "M" || fields[5]?.value ==  "Male") ? 'Male' : "Female",
                sponsorInfo: {
                    name: sponsorInfoPrimary?.fields[0]?.value ?? '',
                    lastName: sponsorInfoPrimary?.fields[1]?.value ?? '',
                    age: age,
                    relationship: sponsorRelationship?.fields[0]?.value ?? '',
                    nationality: sponsorInfoPrimary?.fields[7]?.value ?? '',
                    contactNumbers: contactNumbers,
                    homeAddress: homeAddress,
                    gender: (sponsorInfoPrimary?.fields[6]?.value ==  "M" || sponsorInfoPrimary?.fields[6]?.value ==  "Male") 
                            ? 'Male' : "Female",
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
                houseHoldMembers: [...houseHoldMembers],
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
		});
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
    const { numero } = req.params;
     
  try {
    //checamos si existe el usuario
    const caseObj = await Case.findOne({
      where: { aNumber: numero },
      attributes: ["id", "name", "aNumber", "placeBirth"],
    });
    if (!caseObj) {
      return res.status(404).json({
        success: false,
        msg: "No se encuentra el case con numero " + numero,
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

const createUpdateCaseReferralResource = async (caseReferralResources, caseId) => {
    try {
      caseReferralResources.forEach(async (caseReferral) => {
          let caseReferralId = caseReferral.id ? caseReferral.id :  null;
          if(!caseReferralId){
            const newCaseReferral = await CaseReferralResource.create({
              case_id: caseId,
              referral_id: caseReferral.referral_id,
              name: caseReferral.name
            })
            caseReferralId = newCaseReferral.id;
          }

          const caseReferralList = caseReferral.CaseReferralResourceLists
                                       .filter(it=>!it.id)
                                       .map(itMap => ({
                                          case_referral_id: caseReferralId,
                                          address:  itMap.address,
                                          name: itMap.name,
                                          phone: itMap.phone,
                                          referral_list_id: itMap.referral_list_id,
                                       }))
          await CaseReferralResourceList.bulkCreate(caseReferralList)
      })
    } catch (error) {
      //no pasa nadaa error
      console.log(error)
    }
}

const getSurveyBySection = async (section) => {
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
      return null;
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
        placeholder: question.question_placeholder,
        question_type: question.question_type,
      };
      if (
        question.question_type === "simple_choice" ||
        question.question_type === "multiple_choice"
      ) {
        q.labels =
          question.suggested_answer_ids?.map((it) => ({ id: it.id, value: it.value })) ||
          [];
      }
      sectionMap.get(question.page_id).questions.push(q);
    });

    row.questions =
      bySectionsQs.questions?.map((it) => ({
        id: it.id,
        title: it.title,
        description: it.description,
        placeholder: it.question_placeholder,
        question_type: it.question_type,
        labels:
          it.question_type === "simple_choice" ||
          it.question_type === "multiple_choice"
            ? it.suggested_answer_ids?.map((it) => ({ id: it.id, value: it.value })) || []
            : [],
      })) || [];
    row.sectionsQ = Object.fromEntries(sectionMap.entries());

    return row;
  } catch (error) {
    console.log('-------------------------------error---------------------')
    console.log(error)
    return null;
  }
}

const getQuestionInstructionsBySectionName = async (sectionName) =>{

  try {
      const item = await QuestionInstruction.findOne({
          where: {sectionName: sectionName},
          include: [
              {
                  model: QuestionInstructionSection,
                  include: {
                      model: QuestionInstructionSubsection,
                      include: {
                          model: QuestionInstructionSubsectionList
                      }
                  }
              }
          ]
      });
      if(!item){
          return null
      }

      return item
      
  } catch (error) {
      console.log(error)
      return null
  }
  
}

const createOrUpdateSection = async (data, section, caseId) => {
  try {
    if(!data.id){
      const obj = {
        name: section,
        description: JSON.stringify(data.data),
        section: section,
        case_id: caseId
      }

      const item = await DataReport.create(obj)
      return item;
    }else{
      const itemToUpdate = await DataReport.findByPk(data.id);
      itemToUpdate?.set({
        description: JSON.stringify(data.data)
      });
      await itemToUpdate?.save();
      return item;
    }
  } catch (error) {
    return null;
  }
  
}

module.exports = {
  getCaseList,
  getCase,
  postCase,
  putCase,
  getSearchCasesByStatus,
  getCaseAndStatus,
  postUploadFile,
  getCaseByNumero,
  getCleanCase,
};
