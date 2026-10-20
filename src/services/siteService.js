import db from '../models/index';
import { Op } from 'sequelize';

let imageToString = (image) => {
    if (!image) return '';
    return Buffer.from(image, 'base64').toString('binary');
}

let search = (keyword) => {
    return new Promise(async (resolve, reject) => {
        try {
            let q = (keyword || '').trim();
            if (!q) {
                resolve({ errCode: 0, data: { doctors: [], specialties: [], clinics: [], handbooks: [] } });
                return;
            }
            let like = { [Op.iLike]: `%${q}%` };
            let [doctors, specialties, clinics, handbooks] = await Promise.all([
                db.User.findAll({
                    where: {
                        roleId: 'R2',
                        [Op.or]: [
                            { firstName: like },
                            { lastName: like },
                            db.sequelize.where(
                                db.sequelize.fn('concat', db.sequelize.col('User.lastName'), ' ', db.sequelize.col('User.firstName')), like
                            ),
                            db.sequelize.where(
                                db.sequelize.fn('concat', db.sequelize.col('User.firstName'), ' ', db.sequelize.col('User.lastName')), like
                            ),
                        ]
                    },
                    attributes: ['id', 'firstName', 'lastName'],
                    include: [{ model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] }],
                    limit: 6,
                    raw: true,
                    nest: true
                }),
                db.Specialty.findAll({ where: { name: like }, attributes: ['id', 'name'], limit: 6 }),
                db.Clinic.findAll({ where: { [Op.or]: [{ name: like }, { address: like }] }, attributes: ['id', 'name', 'address'], limit: 6 }),
                db.Handbook.findAll({ where: { title: like }, attributes: ['id', 'title'], limit: 6 }),
            ]);
            resolve({ errCode: 0, data: { doctors, specialties, clinics, handbooks } });
        } catch (e) {
            reject(e);
        }
    })
}

let getListDoctors = (query) => {
    return new Promise(async (resolve, reject) => {
        try {
            let inforWhere = {};
            if (query.specialtyId && query.specialtyId !== 'ALL') inforWhere.specialtyId = query.specialtyId;
            if (query.clinicId && query.clinicId !== 'ALL') inforWhere.clinicId = query.clinicId;
            if (query.provinceId && query.provinceId !== 'ALL') inforWhere.provinceId = query.provinceId;

            let where = { roleId: 'R2' };
            let q = (query.keyword || '').trim();
            if (q) {
                let like = { [Op.iLike]: `%${q}%` };
                where[Op.or] = [{ firstName: like }, { lastName: like }];
            }
            let doctors = await db.User.findAll({
                where: where,
                attributes: { exclude: ['password'] },
                include: [
                    { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] },
                    { model: db.Markdown, attributes: ['description'] },
                    {
                        model: db.Doctor_Infor,
                        where: inforWhere,
                        required: Object.keys(inforWhere).length > 0,
                        attributes: ['specialtyId', 'clinicId', 'provinceId', 'priceId', 'nameClinic', 'addressClinic'],
                        include: [
                            { model: db.Allcode, as: 'priceTypeData', attributes: ['valueEn', 'valueVi'] },
                            { model: db.Allcode, as: 'provinceTypeData', attributes: ['valueEn', 'valueVi'] },
                            { model: db.Specialty, as: 'specialtyData', attributes: ['id', 'name'] },
                        ]
                    },
                ],
                order: [['id', 'ASC']],
                raw: true,
                nest: true
            });
            doctors = doctors.map(item => {
                item.image = imageToString(item.image);
                return item;
            });
            resolve({ errCode: 0, data: doctors });
        } catch (e) {
            reject(e);
        }
    })
}

let getStatistics = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let [doctors, patients, specialties, clinics, handbooks, bookings] = await Promise.all([
                db.User.count({ where: { roleId: 'R2' } }),
                db.User.count({ where: { roleId: 'R3' } }),
                db.Specialty.count(),
                db.Clinic.count(),
                db.Handbook.count(),
                db.Booking.findAll({
                    attributes: ['statusId', [db.sequelize.fn('count', db.sequelize.col('id')), 'total']],
                    group: ['statusId'],
                    raw: true
                }),
            ]);
            let bookingByStatus = {};
            bookings.forEach(item => { bookingByStatus[item.statusId] = +item.total; });
            resolve({
                errCode: 0,
                data: { doctors, patients, specialties, clinics, handbooks, bookingByStatus }
            });
        } catch (e) {
            reject(e);
        }
    })
}

let getBookingsByEmail = (email) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!email) {
                resolve({ errCode: 1, errMessage: 'Missing parameter' });
                return;
            }
            let patient = await db.User.findOne({ where: { email: email.trim() }, attributes: ['id', 'firstName'] });
            if (!patient) {
                resolve({ errCode: 0, data: [] });
                return;
            }
            let data = await db.Booking.findAll({
                where: { patientId: patient.id },
                attributes: ['id', 'statusId', 'doctorId', 'date', 'timeType', 'createdAt'],
                include: [
                    { model: db.Allcode, as: 'timeTypeDataPatient', attributes: ['valueEn', 'valueVi'] },
                    { model: db.Allcode, as: 'statusData', attributes: ['valueEn', 'valueVi'] },
                    {
                        model: db.User, as: 'doctorBookingData', attributes: ['id', 'firstName', 'lastName'],
                        include: [{ model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi'] }]
                    },
                ],
                order: [['date', 'DESC']],
                raw: true,
                nest: true
            });
            resolve({ errCode: 0, data: data });
        } catch (e) {
            reject(e);
        }
    })
}

let cancelBooking = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id || !data.doctorId) {
                resolve({ errCode: 1, errMessage: 'Missing parameter' });
                return;
            }
            let booking = await db.Booking.findOne({
                where: { id: data.id, doctorId: data.doctorId, statusId: { [Op.in]: ['S1', 'S2'] } },
                raw: false
            });
            if (!booking) {
                resolve({ errCode: 2, errMessage: 'Booking not found' });
                return;
            }
            let wasConfirmed = booking.statusId === 'S2';
            booking.statusId = 'S4';
            await booking.save();
            if (wasConfirmed) {
                let schedule = await db.Schedule.findOne({
                    where: { doctorId: booking.doctorId, date: booking.date, timeType: booking.timeType },
                    raw: false
                });
                if (schedule && schedule.currentNumber > 0) {
                    schedule.currentNumber = schedule.currentNumber - 1;
                    await schedule.save();
                }
            }
            resolve({ errCode: 0, errMessage: 'Cancel booking success!' });
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = {
    search: search,
    getListDoctors: getListDoctors,
    getStatistics: getStatistics,
    getBookingsByEmail: getBookingsByEmail,
    cancelBooking: cancelBooking
}
