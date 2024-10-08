 
import db from '../models/index';
const dotenv = require('dotenv');
dotenv.config({ path: 'src/.env' })
import _ from 'lodash';
import EmailService from '../services/EmailService'
let getTopDoctorHome = (limitInput) => {
     return new Promise(async (resolve, reject) => {
         try {
             let users = await db.User.findAll({
                 limit: limitInput,
                 where: { roleId: 'R2' },
                 order: [['createdAt', 'DESC']],
                 attributes: {
                     exclude: ['password'],
                 },
                 include: [
                     {model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi']},
                     {model: db.Allcode, as: 'genderData', attributes: ['valueEn', 'valueVi']}
                 ],
                 raw: true,
                 nest: true
                 
             })
             resolve({
                 errCode: 0,
                 data: users
             });
         } catch (e) {
             reject(e);
         }
     })
}

let getAllDoctors = () =>{
    return new Promise(async(resolve, reject) => { 
        try {
            let doctors = await db.User.findAll({
                where: { roleId: 'R2' },
                attributes: {
                    exclude: ['password', 'image'],
                },
            })
            resolve({
                errCode: 0,
                data: doctors
            })
        } catch (e) { 
            reject(e);
        }
    })
}
let checkRequiredFields = (inputData) => { 
    let arrFields = ['doctorId', 'contentHTML', 'contentMarkdown',
        'action', 
        'selectedPrice', 'selectedPayment', 'selectedProvince',
        'nameClinic', 'addressClinic', 'note', 
         'specialtyId'
    ]
    let isValid = true;
    let element = '';
    for (let i = 0; i < arrFields.length; i++){
        if (!inputData[arrFields[i]]) {
            isValid = false;
            element = arrFields[i];
            break;
        }
    }
    return {
        isValid: isValid,
        element: element
    }
}
let saveDetailInforDoctor = (inputData) => {
    return new Promise(async (resolve, reject) => { 
        try {
            let checkObject =  checkRequiredFields(inputData)
            if (checkObject.isValid === false)  {
                resolve({
                    errCode: 1,
                    errMessage: `Input data is empty: ${checkObject.element}`
                })
            } else {
                 // upsert to Markdown Table

                if (inputData.action === 'CREATE') {
                    
                    await db.Markdown.create({
                        contentHTML: inputData.contentHTML,
                        contentMarkdown: inputData.contentMarkdown,
                        description: inputData.description,
                        doctorId: inputData.doctorId
                    })
                } else if (inputData.action === 'EDIT') {
                    let doctorMarkdown = await db.Markdown.findOne({
                        where: {
                            doctorId: inputData.doctorId
                        },
                        raw: false
                    })
                    if (doctorMarkdown) {
                        doctorMarkdown.contentHTM = inputData.contentHTML;
                        doctorMarkdown.contentMarkdown = inputData.contentMarkdown;
                        doctorMarkdown.descriptio = inputData.description;
                        doctorMarkdown.updateAt = new Date();
                        await doctorMarkdown.save();
                    }
                } 
                // upsert to Doctor Infor Table
                let doctorInfor = await db.Doctor_Infor.findOne({
                    where: {
                        doctorId: inputData.doctorId
                    },
                    raw: false
                })
                if (doctorInfor) { 
                    // Update
                
                    doctorInfor.priceId = inputData.selectedPrice;
                    doctorInfor.provinceId= inputData.selectedProvince;
                    doctorInfor.paymentId= inputData.selectedPayment;
                    doctorInfor.nameClinic= inputData.nameClinic;
                    doctorInfor.addressClinic= inputData.addressClinic;
                    doctorInfor.note = inputData.note;
                    doctorInfor.specialtyId = inputData.specialtyId;
                    doctorInfor.clinicId = inputData.clinicId;

                    await doctorInfor.save();
                } else {
                    // Create
                    await db.Doctor_Infor.create({
                        doctorId: inputData.doctorId,
                        priceId :inputData.selectedPrice,
                        provinceId:inputData.selectedProvince,
                        paymentId:inputData.selectedPayment,
                        nameClinic:inputData.nameClinic,
                        addressClinic: inputData.addressClinic,
                        note: inputData.note,
                        specialtyId: inputData.specialtyId,
                        clinicId: inputData.clinicId,


                    })
                }
                resolve({
                    errCode: 0,
                    errMessage: 'Save infor doctor Success!'
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}

let getDetailDoctorById = (inputId) => { 
    return new Promise(async(resolve, reject) => {
        try {
            if (!inputId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter '
                })
            }
            else {
                let data = await db.User.findOne({
                    where: { id: inputId },
                    attributes: {
                        exclude: ['password'],
                    },
                    include: [
                        {
                            model: db.Markdown,
                            attributes: ['description', 'contentHTML', 'contentMarkdown']
                         },
                        {model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi']},
                        {
                            model: db.Doctor_Infor,
                            // attributes: ['description', 'contentHTML', 'contentMarkdown']
                            attributes: {
                                exclude: ['id', 'doctorId'],
                            },
                            include: [
                                {model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi']},
                                {model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi']},
                                {model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi']},

                            ]
                        }
                        
                    ],
                    raw: false,
                    nest: true
                })
                if (data && data.image) {
                    data.image = Buffer.from(data.image, 'base64').toString('binary');

                }
                if(!data) data = {};
                resolve({
                    errCode: 0,
                    data: data
                })
            }
        } catch (e){
            reject(e);
        }
    })
}
let bulkCreateSchedule = (data) => {
    return new Promise(async(resolve, reject) => {
        try {
            
            if (!data.arrSchedule || !data.doctorId || !data.formatedDate) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter'
                })
               
            } else {
                
                let schedule = data.arrSchedule;
                if (schedule && schedule.length > 0) {
                    schedule = schedule.map(item => {
                        item.maxNumber = process.env.MAX_NUMBER_SCHEDULE;
                        return item;
                    })
                }

                // get all  existing data 
                let existing = await db.Schedule.findAll(
                    {
                        where: { doctorId: data.doctorId, date: data.formatedDate },
                        attributes: ['timeType', 'date', 'doctorId', 'maxNumber'],
                        raw: true
                    }
                )
                // convert date 
                // if (existing && existing.length > 0) { 
                //     existing = existing.map(item => {
                //         item.date = new Date(item.date).getTime();
                //         return item;
                //     })
                // }
                let toCreate = _.differenceWith(schedule, existing, (a, b) => {
                    return a.timeType === b.timeType && +a.date === +b.date;
                });
                if (toCreate && toCreate.length > 0) {
                    await db.Schedule.bulkCreate(toCreate)
                }
                // await  db.Schedule.bulkCreate(schedule)
                resolve({
                    errCode: 0,
                    errMessage: 'Create schedule success!'
                })
            }

        } catch (e){
            reject(e);
        }
    })
}
let getScheduleByDate = (doctorId, date) => {
    return new Promise(async (resolve, reject) => { 
        try {
            if (!doctorId || !date) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter '
 
               })
            } else {
                let dataSchedule = await db.Schedule.findAll({
                    where: {
                        doctorId: doctorId,
                        date: date
                    },
                    include: [
                        {model: db.Allcode, as: 'timeTypeData', attributes: ['valueEn', 'valueVi']},
                        {model: db.User, as: 'doctorData', attributes: ['firstName', 'lastName']},

                    
                    
                    ],
                    raw: true,
                    nest: true
                    
                })
                if (!dataSchedule) dataSchedule = [];
                resolve({
                    errCode: 0,
                    data: dataSchedule
                })
           }
        } catch (e) {
            reject(e);
        }
    })
}
let getExtraInforDoctorById = (idInput) => {
    return new Promise(async (resolve, reject) => { 
        try {
            if (!idInput) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter '
 
               })
            } else {
                let data = await db.Doctor_Infor.findOne({
                    where: {
                        doctorId: idInput,
                    },
                    attributes: {
                        exclude: ['id', 'doctorId'],
                    },
                    include: [
                        {model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi']},
                        {model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi']},
                        {model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi']},

                    ],
                    raw: false,
                    nest: true
                    
                })
                if (!data) data = {};
                resolve({
                    errCode: 0,
                    data: data
                })
           }
        } catch (e) {
            reject(e);
        }
    })
}
let getProfileDoctorById =  (inputId) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!inputId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter '
 
               })
            } else {
                let data = await db.User.findOne({
                    where: { id: inputId },
                    attributes: {
                        exclude: ['password'],
                    },
                    include: [
                        {
                            model: db.Markdown,
                            attributes: ['description', 'contentHTML', 'contentMarkdown']
                         },
                        {model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi']},
                        {
                            model: db.Doctor_Infor,
                            // attributes: ['description', 'contentHTML', 'contentMarkdown']
                            attributes: {
                                exclude: ['id', 'doctorId'],
                            },
                            include: [
                                {model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi']},
                                {model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi']},
                                {model: db.Allcode, as: 'paymentTypeData', attributes: ['valueEn', 'valueVi']},

                            ]
                        }
                        
                    ],
                    raw: false,
                    nest: true
                })
                if (data && data.image) {
                    data.image = Buffer.from(data.image, 'base64').toString('binary');

                }
                if(!data) data = {};
                resolve({
                    errCode: 0,
                    data: data
                })
            }
        } catch (e) { 
            reject(e);
        }
    })    
}

let getListPatientForDoctor =  (doctorId, date) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!doctorId && !date) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter '
 
               })
            } else {
                let data = await db.Booking.findAll({
                    where: {
                        statusId: 'S2',
                        doctorId: doctorId,
                        date: date
                    },
                    include: [
                        {
                            model: db.User, as: 'patientData',
                            attributes: ['email', 'firstName', 'address', 'gender'],
                            include: [
                                { model: db.Allcode, as: 'genderData', attributes: ['valueEn', 'valueVi'] },
                            ]
                        },
                        { model: db.Allcode, as: 'timeTypeDataPatient', attributes: ['valueEn', 'valueVi'] },

                    ],
                    raw: false,
                    nest: true

                })
                
                resolve({
                    errCode: 0,
                    data: data 
 
               })
            }
        } catch (e) { 
            reject(e);
        }
    })    
}
let sendRemedy =  (data) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (!data.email && !data.doctorId
                || !data.patientId || !data.timeType
            ) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter '
 
               })
            } else {
                //    update patient status
                let appoinment = await db.Booking.findOne({
                    where: {
                        patientId: data.patientId,
                        doctorId: data.doctorId,
                        statusId: 'S2',
                        timeType: data.timeType
                    },
                    raw: false,

                })

                if (appoinment) {
                    // Update
                    appoinment.statusId = 'S3';
                   
                    await appoinment.save();
                }
                // send email remedy
                await EmailService.sendAttachment(data)
                resolve({
                    errCode: 0,
                    errMessage: 'Send remedy success!'
                })
            }
        } catch (e) { 
            reject(e);
        }
    })    
}
 module.exports = {
     getTopDoctorHome: getTopDoctorHome,
     getAllDoctors: getAllDoctors,
     saveDetailInforDoctor: saveDetailInforDoctor,
     getDetailDoctorById: getDetailDoctorById,
     bulkCreateSchedule: bulkCreateSchedule,
     getScheduleByDate: getScheduleByDate,
     getExtraInforDoctorById: getExtraInforDoctorById,
     getProfileDoctorById: getProfileDoctorById,
     getListPatientForDoctor: getListPatientForDoctor,
     sendRemedy: sendRemedy
 }
