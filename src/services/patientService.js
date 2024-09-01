import db from '../models/index';
import EmailService from './EmailService';
const dotenv = require('dotenv');
dotenv.config({ path: 'src/.env' })
import { v4 as uuidv4 } from 'uuid';


let buildUrlEmail = (doctorId, token) => {
    let result = `${process.env.URL_REACT}/verify-booking?token=${token}&doctorId=${doctorId}`;
    return result
}




let postBookingAppoinment = (data) => {
    return new Promise(async(resolve, reject) => { 
        try {
            if (!data.email || !data.doctorId || !data.date
                || !data.timeType || !data.fullName || !data.selectedGender
                || !data.address
            ) {
                resolve({
                    errCode: 1,
                    errMessage: 'Input data is empty!'
                })
            } else {
                let token = uuidv4(); // ⇨ '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'

                await EmailService.sendEmail({
                    receiverEmail: data.email,
                    patientName: data.fullName,
                    time: data.timeString,
                    doctorName: data.doctorName,
                    language: data.language,
                    redirectLink: buildUrlEmail(data.doctorId, token),

                });
                // upser patient
                  let user = await db.User.findOrCreate({
                    where: { email: data.email },
                    defaults: {
                        email: data.email,
                        roleId: 'R3',
                        gender: data.selectedGender,
                        address: data.address,
                        firstName: data.fullName
                    }
                  });
                
                // create a booking record
                if (user && user[0]) {
                    await db.Booking.findOrCreate({
                        where: {
                            patientId: user[0].id 
                            
                        },
                        defaults: {
                        statusId: 'S1',
                        doctorId: data.doctorId,
                        patientId: user[0].id,
                        date: data.date,
                        timeType: data.timeType,
                        token: token
                        }
                       })
                }
                resolve({
                    
                    errCode: 0,
                    errMessage: 'Save infor patient Success!'
                });

            }
           
        } catch(e) {
            reject(e);
        }
    })
}
let postVerifyBookAppoinment = (data) => {
    return new Promise(async (resolve, reject) => { 
        try {
            if (!data.doctorId || !data.token) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                })
            } else {
                let appoinment = await db.Booking.findOne({
                    where: {
                        doctorId: data.doctorId,
                        token: data.token,
                        statusId: 'S1',
                    },
                    raw: false
                })
                if (appoinment) {
                    appoinment.statusId = 'S2';
                    await appoinment.save();
                    resolve({
                        errCode: 0,
                        errMessage: 'Update appoinment success!'
                    });
                } else {
                    resolve({
                        errCode: 2,
                        errMessage: 'Appoinment not found or expired'
                    });
                }
            }
            
        } catch(e) {
            reject(e);
        }
    })
}
module.exports = {
    postBookingAppoinment: postBookingAppoinment,
    postVerifyBookAppoinment: postVerifyBookAppoinment
}