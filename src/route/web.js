import express from 'express';
import homController from '../controllers/homeController';
import userController from '../controllers/userController';
import doctorController from '../controllers/doctorController';
import patientController from '../controllers/patientController';
import specialtyController from '../controllers/specialtyController';
import clinicController from '../controllers/clinicController';
let router = express.Router();

let initWebRoutes = (app) =>{
    router.get('/', homController.getHomePage);
    router.get('/about', homController.getAboutPage);
    router.get('/crud', homController.getCRUD);
    router.post('/post-crud', homController.postCRUD);
    router.get('/get-crud', homController.displayGetCRUD);
    router.get('/edit-crud', homController.getEditCRUD);
    router.post('/put-crud', homController.putCRUD);
    router.get('/delete-crud', homController.deleteCRUD);
    
    router.post('/api/login', userController.handleLogin);
    router.get('/api/get-all-users', userController.handleGetAllUsers);
    router.post('/api/create-new-user', userController.handleCreateNewlUser);
    router.put('/api/edit-user', userController.handleEditUser);
    router.delete('/api/delete-user', userController.handleDeleteUser);
    router.get('/api/allcode', userController.getAllCode);

    router.get('/api/top-doctor-home', doctorController.getTopDoctorHome);
    router.get('/api/get-all-doctors', doctorController.getAllDoctors);
    router.post('/api/save-infor-doctors', doctorController.postInforDoctors);
    router.get('/api/get-detail-doctor-by-id', doctorController.getDetailDoctorById);
    router.post('/api/bulk-create-schedule', doctorController.bulkCreateSchedule)
    router.get('/api/get-schedule-doctor-by-date', doctorController.getScheduleByDate);
    router.get('/api/get-extra-infor-doctor-by-id', doctorController.getExtraInforDoctorById);
    router.get('/api/get-profile-doctor-by-id', doctorController.getProfileDoctorById);
    //  patient
    router.get('/api/get-list-patient-for-doctor', doctorController.getListPatientForDoctor)
    router.post('/api/send-remedy', doctorController.sendRemedy);


    router.post('/api/patient-book-appoinment', patientController.postBookingAppoinment);
    router.post('/api/verify-book-appoinment', patientController.postVerifyBookAppoinment);
    // Specialty API
    router.post('/api/create-new-specialty', specialtyController.createSpecialty);
    router.get('/api/get-specialty', specialtyController.getAllSpecialty);
    router.get('/api/get-detail-specialty-by-id', specialtyController.getDetailSpecialtyById);
    // Clinic API
    router.post('/api/create-new-clinic', clinicController.createClinic);
    router.get('/api/get-clinic', clinicController.getAllClinic);
    router.get('/api/get-detail-clinic-by-id', clinicController.getDetailClinicyById);

    return app.use("/", router);
} 
module.exports = initWebRoutes; 