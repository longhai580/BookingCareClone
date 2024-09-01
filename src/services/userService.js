import db from '../models/index';
import  bcrypt from 'bcryptjs';

const salt = bcrypt.genSaltSync(10);

let handleUserLogin = (email, password) =>{
    return new Promise(async(resolve, reject) =>{
        try{
            let userData ={};
            let isExist = await checkUserEmail(email);
            if(isExist){
                // user already exists
                let user = await db.User.findOne({
                    attributes: ['id', 'email', 'roleId', 'password', 'firstName', 'lastName'],
                    where:{ email : email },
                    raw: true
                });
                if(user){
                // compare the password
                let check = await bcrypt.compareSync(password, user.password);
                if(check){
                    userData.errCode = 0;
                    userData.message = 'login successfully';
                    delete user.password;
                    userData.user = user;
                }else{
                    userData.errCode = 3;
                    userData.message = 'Wrong password';
                }
                }else{
                    userData.errCode = 2;
                    userData.message = `User's isn't available`;
                }
            }else{
                // return error
                userData.errCode = 1;
                userData.message = 'email does not exist';
            }
            resolve(userData);
        }catch(e){
            reject(e);
        }
    })

    
}

let checkUserEmail = (userEmail) =>{
    return new Promise(async(resolve, reject) =>{
        try{
            let user = await db.User.findOne({
                where: {email: userEmail}
            })
            console.log(user);
            if(user){
                resolve(true);
            }else{
                resolve(false);
            }
        }catch(e){
            reject(e);
        }
    })
}

let getAllUsers = (userId)=>{
    return new Promise(async(resolve, reject) => {
        try{
            let users = '';
            if(userId === 'ALL' ){

                users = await db.User.findAll({
                    attributes: {
                        exclude: ['password']
                    },

                });
            }
            if(userId & userId !== 'ALL'){

                users = await db.User.findOne({
                   
                    where: {id: userId},
                    attributes: {
                        exclude: ['password']
                    },

                })
            }

            resolve(users);
        } catch(e){
            reject(e);
        }
    })
}
let hashUserPassword = (password)=>{
    return new Promise (async (resolve,reject)=>{
        try{
            let  hashPassword = await bcrypt.hashSync(password, salt);
            resolve(hashPassword);
        }catch(e){
            reject(e);ject(e);
        }
    })
}

let createNewUser = (data) =>{
    return new Promise(async (resolve, reject) => { 
        //  check email is exist 
        try {
            let check = await checkUserEmail(data.email);
            if (check === true) {
                resolve({
                    errCode: 1,
                    errMessage: 'Your email already exist. Please try again !!!'
                });
            } else {
                
                let  hashPasswordFromBcrypt =  await hashUserPassword(data.password);
                await db.User.create({
                    email: data.email,
                    password: hashPasswordFromBcrypt,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    address: data.address,
                    phonenumber:data.phonenumber,
                    gender: data.gender ,
                    roleId: data.roleId,
                    positionId: data.positionId,
                    image: data.avatar
    
                })
                resolve({
                    errCode: 0,
                    message: 'OK success'
                });
            }
        } catch (e) {
            reject(e);
        }

    })
    
}

let updateUserData = (data) => {
    return new Promise(async(resolve, reject) => { 
        try {
            if (!data.id || !data.roleId || !data.positionId || !data.gender) {
                resolve({
                    errCode: 2,
                    message: 'Missing required parameters'
                })
            }
            let user = await db.User.findOne({
                where: { id: data.id },
                raw: false
            })
            if(user){
                user.firstName = data.firstName;
                user.lastName = data.lastName;
                user.address = data.address;
                user.roleId = data.roleId;
                user.positionId = data.positionId;
                user.gender = data.gender;
                user.phonenumber = data.phonenumber;
                if (data.avatar) { 
                    user.image = data.avatar;
                }
                await user.save();
                resolve({
                    errCode: 0,
                    message: 'Update user successed'
                    
                });

            }else{
                resolve({
                    errCode: 1,
                    message: 'User does not exist'
                });
            }
        } catch(e){
            reject(e);
        }
    })
}

let deleteUser = (userId) => {
    return new Promise(async(resolve, reject) => { 
        let user = await db.User.findOne({
            where:{ id : userId }
        });
        console.log(user)
        if (!user) {
            resolve({
                errCode: 2,
                message: 'User does not exist'
            })
        }
        await db.User.destroy({
                where:{ id : userId }
            
            });
        resolve({
            errCode: 0,
            message: 'Delet user success !'
        })
    })
}

let getAllCodeService = (typeInput) => {
    return new Promise(async(resolve, reject) => { 
        try {
            if (!typeInput) {
                resolve({
                    errCode: 1,
                    message: 'Missing required parameter'
                });
            } else {
                let res = {};
                let allCode = await db.Allcode.findAll({
                    where: {type: typeInput}
                });
                res.errCode = 0;
                res.data = allCode
                resolve(res);
            }
        } catch (e) {
            reject(e);
        }
    })
}

module.exports ={
    handleUserLogin: handleUserLogin,
    checkUserEmail: checkUserEmail,
    getAllUsers: getAllUsers,
    createNewUser: createNewUser,
    updateUserData: updateUserData,
    deleteUser: deleteUser,
    getAllCodeService: getAllCodeService
}