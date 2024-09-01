import patientService from '../services/patientService'

let postBookingAppoinment = async (req, res) => {
    try {
        let infor = await patientService.postBookingAppoinment(req.body);
        return res.status(200).json(infor);
    } catch (e) {   
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server!'
        })
    }
}

let postVerifyBookAppoinment = async(req, res) => {
    try {
        let infor = await patientService.postVerifyBookAppoinment(req.body);
        return res.status(200).json(infor);
    } catch (e) {   
        console.log(e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server!'
        })
    }
}
module.exports = {
    postBookingAppoinment: postBookingAppoinment,
    postVerifyBookAppoinment: postVerifyBookAppoinment
}