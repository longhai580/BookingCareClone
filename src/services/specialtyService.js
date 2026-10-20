import db from '../models/index';
const dotenv = require('dotenv');
dotenv.config({ path: 'src/.env' })
let createSpecialty = (data) => {
    return new Promise(async(resolve, reject) => { 
        try {
           
            if (!data.name
                || !data.imageBase64
                || !data.descriptionHTML
                || !data.descriptionMarkdown 
            ) {
                resolve({
                    errCode: 1,
                    errMessage: 'Input data is empty!'
                })
            } else {
                await db.Specialty.create({
                    name: data.name,
                    image: data.imageBase64,
                    descriptionHTML: data.descriptionHTML,
                    descriptionMarkdown: data.descriptionMarkdown,
                })
                resolve({
                    errCode: 0,
                    errMessage: 'Create success!'
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}
let getAllSpecialty = () => {
    return new Promise(async(resolve, reject) => { 
        try {
           
            let data = await db.Specialty.findAll({
                
            });
            if (data && data.length > 0) { 
                data.map(item => {
                    item.image = Buffer.from(item.image, 'base64').toString('binary');
                    return item;
                })
            }
            resolve({
                errCode: 0,
                data: data,
                errMessage: 'Get all success!'
            });
        } catch (e) {
            reject(e);
        }
    })
}
let getDetailSpecialtyById = (inputId, location) => {
    return new Promise(async (resolve, reject) => { 
        try {
            if (!inputId || !location)  {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter '
                })
            } else {
                       
                let data = await db.Specialty.findOne({
                    where: {
                        id: inputId
                    },
                    attributes:['id', 'name', 'image', 'descriptionHTML', 'descriptionMarkdown']
                })
                if (data) {
                    if (data.image) data.image = Buffer.from(data.image, 'base64').toString('binary');
                    let doctorSpecialty = [];
                    if (location === 'ALL') {
                        doctorSpecialty = await db.Doctor_Infor.findAll({
                            where: {
                                specialtyId: inputId
                            },
                            attributes: ['doctorId', 'provinceId']
                        })
                    } else {
                        doctorSpecialty = await db.Doctor_Infor.findAll({
                            where: {
                                specialtyId: inputId,
                                provinceId: location
                            },
                            attributes: ['doctorId', 'provinceId']
                        })
                    }
                   
                    data.doctorSpecialty = doctorSpecialty;
                } else data = {};
                resolve({
                    errCode: 0,
                    data: data,
                    errMessage: 'Get detail success!'
                })
                
                
                
               
            }
        } catch (e) {
            reject(e);
        }
    })
}

let updateSpecialty = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id || !data.name || !data.descriptionHTML || !data.descriptionMarkdown) {
                resolve({ errCode: 1, errMessage: 'Input data is empty!' })
            } else {
                let item = await db.Specialty.findOne({ where: { id: data.id }, raw: false });
                if (!item) {
                    resolve({ errCode: 2, errMessage: 'Specialty not found!' })
                } else {
                    item.name = data.name;
                    item.descriptionHTML = data.descriptionHTML;
                    item.descriptionMarkdown = data.descriptionMarkdown;
                    if (data.imageBase64) item.image = data.imageBase64;
                    await item.save();
                    resolve({ errCode: 0, errMessage: 'Update success!' })
                }
            }
        } catch (e) {
            reject(e);
        }
    })
}
let deleteSpecialty = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) {
                resolve({ errCode: 1, errMessage: 'Missing parameter' })
            } else {
                await db.Specialty.destroy({ where: { id: id } });
                resolve({ errCode: 0, errMessage: 'Delete success!' })
            }
        } catch (e) {
            reject(e);
        }
    })
}
module.exports = {
    createSpecialty: createSpecialty,
    getAllSpecialty: getAllSpecialty,
    getDetailSpecialtyById: getDetailSpecialtyById,
    updateSpecialty: updateSpecialty,
    deleteSpecialty: deleteSpecialty
}
