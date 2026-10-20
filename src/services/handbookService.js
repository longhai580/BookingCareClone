import db from '../models/index';

let createHandbook = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.title || !data.imageBase64 || !data.contentHTML || !data.contentMarkdown) {
                resolve({ errCode: 1, errMessage: 'Input data is empty!' })
            } else {
                await db.Handbook.create({
                    title: data.title,
                    image: data.imageBase64,
                    description: data.description,
                    contentHTML: data.contentHTML,
                    contentMarkdown: data.contentMarkdown,
                })
                resolve({ errCode: 0, errMessage: 'Create success!' })
            }
        } catch (e) {
            reject(e);
        }
    })
}

let getAllHandbook = (limit) => {
    return new Promise(async (resolve, reject) => {
        try {
            let options = {
                attributes: ['id', 'title', 'image', 'description', 'createdAt'],
                order: [['createdAt', 'DESC']],
            };
            if (limit) options.limit = +limit;
            let data = await db.Handbook.findAll(options);
            resolve({ errCode: 0, data: data })
        } catch (e) {
            reject(e);
        }
    })
}

let getDetailHandbookById = (inputId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputId) {
                resolve({ errCode: 1, errMessage: 'Missing parameter' })
            } else {
                let data = await db.Handbook.findOne({ where: { id: inputId } });
                resolve({ errCode: 0, data: data ? data : {} })
            }
        } catch (e) {
            reject(e);
        }
    })
}

let updateHandbook = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id || !data.title || !data.contentHTML || !data.contentMarkdown) {
                resolve({ errCode: 1, errMessage: 'Input data is empty!' })
            } else {
                let handbook = await db.Handbook.findOne({ where: { id: data.id }, raw: false });
                if (!handbook) {
                    resolve({ errCode: 2, errMessage: 'Handbook not found!' })
                } else {
                    handbook.title = data.title;
                    handbook.description = data.description;
                    handbook.contentHTML = data.contentHTML;
                    handbook.contentMarkdown = data.contentMarkdown;
                    if (data.imageBase64) handbook.image = data.imageBase64;
                    await handbook.save();
                    resolve({ errCode: 0, errMessage: 'Update success!' })
                }
            }
        } catch (e) {
            reject(e);
        }
    })
}

let deleteHandbook = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) {
                resolve({ errCode: 1, errMessage: 'Missing parameter' })
            } else {
                await db.Handbook.destroy({ where: { id: id } });
                resolve({ errCode: 0, errMessage: 'Delete success!' })
            }
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = {
    createHandbook: createHandbook,
    getAllHandbook: getAllHandbook,
    getDetailHandbookById: getDetailHandbookById,
    updateHandbook: updateHandbook,
    deleteHandbook: deleteHandbook
}
