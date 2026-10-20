
const dotenv = require('dotenv');
dotenv.config({ path: 'src/.env' })
import nodemailer from 'nodemailer';

let isEmailConfigured = () => !!(process.env.EMAIL_APP && process.env.EMAIL_APP_PASSWORD);

let sendEmail = async(dataSend) => {
    if (!isEmailConfigured()) {
      console.log('[EmailService] EMAIL_APP is not configured, skip sending. Verify link:', dataSend.redirectLink);
      return false;
    }
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // Use `true` for port 465, `false` for all other ports
        auth: {
          user: process.env.EMAIL_APP,
          pass: process.env.EMAIL_APP_PASSWORD,
        },
      });

    let info = await transporter.sendMail({
        from: '"Long Hai 👻" <nlhai050802@gmail.com>', // sender address
        to: dataSend.receiverEmail, // list of receivers
        subject: "Thông tin đặt lịch khám bệnh", // Subject line
      html: getBodyHTMLEmail(dataSend)
      , // html body
    });
      
        
      
}

let getBodyHTMLEmail = (dataSend) => {
  let result = ''
  if (dataSend.language === 'vi') {
    result = `
        <h3>Xin chào ${dataSend.patientName}!</h3>
        <p>Bạn nhận được email này vì đã đặt lịch khám bệnh online trên Booking Medical</p>
        <p>Thông tin đặt lịch khám bệnh:</p>
        <div><b>Thời gian: ${dataSend.time}</b></div>
        <div><b>Bác sĩ: ${dataSend.doctorName}</b></div>
        <p>Nếu các thông tin trên là đúng sự thật, vui lòng click vào đường link
        bên dưới để xác nhận và hoàn tất thủ tục đăt lịch khám bệnh.</p>
        <div>
        <a href=${dataSend.redirectLink} tarfet="_blank" >Click here</a>
        </div>
        <div>Xin trân trọng cảm ơn!</div>
      `
  }
  if (dataSend.language === 'en') {
    result = `
      <h3>Hello ${dataSend.patientName}!</h3>
      <p>You have received this email because you booked an online medical appointment on Booking Medical.</p>
      <p>Appointment information:</p>
      <div><b>Time: ${dataSend.time}</b></div>
      <div><b>Doctor: ${dataSend.doctorName}</b></div>
      <p>If the above information is correct, please click the link below to confirm and complete the appointment booking procedure.</p>
      <div>
      <a href=${dataSend.redirectLink} target="_blank">Click here</a>
      </div>
      <div>Thank you very much!</div>
    `
  }
  return result;
}
let getBodyHTMLEmailRemedy = (dataSend) => { 
  let result = ''
  if (dataSend.language === 'vi') {
    result = `
      <h3>Xin chào ${dataSend.patientName} </h3>
        <p>Bạn nhận được email này vì đã đặt lịch khám bệnh online trên Booking Medical thàng công.</p>
        <p>Thông tin đơn thuốc và hoá đơn được gửi trong file đính kèm</p>

       
        <div>Xin trân trọng cảm ơn!</div>
      `
  }
  if (dataSend.language === 'en') {
    result = `
      <h3>Dear ${dataSend.patientName} </h3>

      <p>You have received this email because you booked an online medical appointment on Booking Medical.</p>
      <p>Appointment information:</p>
    
      <p>If the above information is correct, please click the link below to confirm and complete the appointment booking procedure.</p>
      <div>
      </div>
      <div>Thank you very much!</div>
    `
  }
  return result;
}
let sendAttachment = async (dataSend) => {
  if (!isEmailConfigured()) {
    console.log('[EmailService] EMAIL_APP is not configured, skip sending remedy to', dataSend.email);
    return false;
  }
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.EMAIL_APP,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

let info = await transporter.sendMail({
    from: '"Long Hai 👻" <nlhai050802@gmail.com>', // sender address
    to: dataSend.email, // list of receivers
    subject: "Kết qủa đặt lịch khám bệnh", // Subject line
  html: getBodyHTMLEmailRemedy(dataSend),
  attachments: [
    {
      filename: `remedy-${dataSend.patientId}-${new Date().getTime()}.png`,
      content: dataSend.imgBase64.split("base64,")[1], // Replace with your file path
      encoding: 'base64' // required, use unique name for each attachment
    }
  ]
});
}
module.exports = {
  sendEmail: sendEmail,
  sendAttachment: sendAttachment,
  isEmailConfigured: isEmailConfigured
}