import db from '../models/index';
import EmailService from './EmailService';
const dotenv = require('dotenv');
dotenv.config({ path: 'src/.env' })
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';


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
                let redirectLink = buildUrlEmail(data.doctorId, token);

                let schedule = await db.Schedule.findOne({
                    where: { doctorId: data.doctorId, date: data.date, timeType: data.timeType }
                });
                if (schedule && schedule.maxNumber && +schedule.currentNumber >= +schedule.maxNumber) {
                    resolve({
                        errCode: 3,
                        errMessage: 'This time slot is fully booked!'
                    });
                    return;
                }

                // upser patient
                let user = await db.User.findOrCreate({
                    where: { email: data.email },
                    defaults: {
                        email: data.email,
                        roleId: 'R3',
                        gender: data.selectedGender,
                        address: data.address,
                        phonenumber: data.phoneNumber,
                        firstName: data.fullName
                    }
                });

                // create a booking record
                if (user && user[0]) {
                    let existing = await db.Booking.findOne({
                        where: {
                            patientId: user[0].id,
                            doctorId: data.doctorId,
                            date: '' + data.date,
                            timeType: data.timeType,
                            statusId: { [Op.in]: ['S1', 'S2'] }
                        }
                    });
                    let created = !existing;
                    if (created) {
                        await db.Booking.create({
                            statusId: 'S1',
                            doctorId: data.doctorId,
                            patientId: user[0].id,
                            date: data.date,
                            timeType: data.timeType,
                            token: token
                        });
                    }
                    if (!created) {
                        resolve({
                            errCode: 2,
                            errMessage: 'You have already booked this time slot!'
                        });
                        return;
                    }
                }

                let isSent = false;
                try {
                    isSent = await EmailService.sendEmail({
                        receiverEmail: data.email,
                        patientName: data.fullName,
                        time: data.timeString,
                        doctorName: data.doctorName,
                        language: data.language,
                        redirectLink: redirectLink,
                    }) !== false;
                } catch (e) {
                    console.log('Send booking email failed: ', e.message);
                }
                let result = {
                    errCode: 0,
                    emailSent: isSent,
                    errMessage: 'Save infor patient Success!'
                };
                // without SMTP config (local dev), return the verify link so the flow can still be completed
                if (!isSent && process.env.NODE_ENV === 'development') {
                    result.verifyLink = redirectLink;
                }
                resolve(result);

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
                    let schedule = await db.Schedule.findOne({
                        where: { doctorId: appoinment.doctorId, date: appoinment.date, timeType: appoinment.timeType },
                        raw: false
                    });
                    if (schedule) {
                        schedule.currentNumber = (schedule.currentNumber || 0) + 1;
                        await schedule.save();
                    }
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