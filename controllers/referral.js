const { ERROR500 } = require("../constant/errors");
const { Stages, Referral, ReferralList } = require("../models/case")

const getReferralList = async (req, res) =>{

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

    const { count, rows } = await Referral.findAndCountAll({
        attributes: ['id','name'],
        include: [ReferralList],
        offset: page * size,
        limit: size
    });

    return res.json({ content: rows, total_pages: Math.ceil(count / size) }) 
}

const getReferral = async (req, res) => {
    const { id } = req.params;

    try {

        //checamos si existe el usuario
        const item = await Referral.findByPk(id, {
            include: [ReferralList]
        });
        if(!item){
            return res.status(404).json({
                success: false,
                msg: "No se encuentra el stage con id "+id
            })
        }

        return res.status(200).json({
            success: true,
            msg: 'success',
            content: item
        })
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: ERROR500,
            errors: error
        })
    }
}

const postReferral = async (req, res) =>{
    const { body } = req
    try {
        const referral = await Referral.create(body);
        //aqui hay q salvar los referral list
        const referralList = body.referral_list_ids.map((it) => ({
            ...it,
            referral_id: referral.getDataValue("id"),
          }));
        await ReferralList.bulkCreate(referralList);
        return res.status(200).json({
            success: true,
            msg: 'salvado correctamente',
            content: referral
        })
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: ERROR500,
            errors: error.errors
        })
    }
}

const putReferral = async (req, res) =>{
    const { id } = req.params;
    const { body } = req
    try {

        //checamos si existe el usuario
        const referral = await Referral.findByPk(id);
        if(!referral){
            return res.status(404).json({
                success: false,
                msg: "No se encuentra el satges con id "+id
            })
        }
        await referral.update(body)
        //aqui hay q salvar los referral list
        const newReferralList = body.referral_list_ids.filter((item) => !item.id)
        .map((it) => ({ ...it, referral_id: id }));
        await ReferralList.bulkCreate(newReferralList);
        body.referral_list_ids.forEach(async (element) => {
            if (element.id) {
                const rList = await ReferralList.findByPk(element.id);
                rList?.set(element);
                await rList?.save();
            }
        });
        return res.status(200).json({
            success: true,
            msg: 'success',
            content: referral
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

const deleteReferralList = async (req, res) =>{
    const { id } = req.params;
    try {

        //checamos si existe el usuario
        const item = await ReferralList.findByPk(id);
        if(!item){
            return res.status(404).json({
                success: false,
                msg: "No se encuentra el usuario con id "+id
            })
        }

        await item.destroy()
        return res.status(200).json({
            success: true,
            msg: 'success'
        })
        
    } catch (error) {
        return res.status(500).json({
            msg: ERROR500,
            errors: error.errors
        })
    }
}

const getReferralEntity = async (req, res) => {
    const referrals = await Referral.findAll({
        include: [ReferralList]
    });
    return res.status(200).json({
        success: true,
        msg: 'success',
        content: referrals
    })
}

module.exports = {
    getReferralList,
    getReferral,
    postReferral,
    putReferral,
    deleteReferralList,
    getReferralEntity,
}