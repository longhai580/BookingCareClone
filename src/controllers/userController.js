import userService from '../services/userService';



let handleLogin = async (req,res) => {
    let email = req.body.email;
    let password = req.body.password;

    if(!email || !password){
        return res.status(500).json({
            errCode: 1,
            message: 'email or password is empty'
        })
    }
    let userData = await userService.handleUserLogin(email, password);

    //  check email exist
    // compare password
    //  return userInformation
    //  access_token : JWT
    return res.status(200).json({
        errCode: userData.errCode,
        message: userData.message,
        user : userData.user ? userData.user : {}
    })
}
let handleGetAllUsers = async(req,res) =>{
    let id = req.query.id;
    if(!id){
        return res.status(200).json({
            errCode: 1 ,
            message: 'Missing required parameter',
            users: []
        })
    }
    let users = await userService.getAllUsers(id);
    return res.status(200).json({
        errCode:0,
        message: 'Success',
        users
    })
}
let handleCreateNewlUser = async (req, res) => { 
    let message = await userService.createNewUser(req.body);
    console.log('message create api: ', message);
    return res.status(200).json(message);
}

let handleEditUser = async (req, res) => { 
    let data = req.body;
    let message = await userService.updateUserData(data);
    return res.status(200).json(message);
}
let handleDeleteUser = async(req, res) => {
    if (!req.body.id) {
        return (
            res.status(200).json({
                errCode: 1,
                message: 'Missing required parameter'
            })
        )
    }
    let message = await userService.deleteUser(req.body.id);
    return res.status(200).json(message);
}

let getAllCode = async(req, res) => {
    try {
        let data = await userService.getAllCodeService(req.query.type);
        return res.status(200).json(data)
    } catch (e) {
        console.log('Get all code error',e);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server !',
        })
    }
}
module.exports ={
    handleLogin: handleLogin,
    handleGetAllUsers: handleGetAllUsers,
    handleCreateNewlUser: handleCreateNewlUser,
    handleEditUser: handleEditUser,
    handleDeleteUser: handleDeleteUser,
    getAllCode: getAllCode,
}