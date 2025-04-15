import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import path from 'path'; 

const handlebarOptions = {
    viewEngine: {
        partialsDir: path.resolve('./views/'),
        defaultLayout: false,
    },
    viewPath: path.resolve('./views/'),
}; 

const sendEmail = async(details)=>{
    let mailDetails = {
        from: { name: "Trident", address: process.env.MAIL_FROM },
        to: details?.email,
        // cc: "dheeraj1visionvivante@gmail.com",
        subject: details?.subject 
    };
    if(details?.template){
        mailDetails.template = details.template;
        mailDetails.context = details.context;
       nodemailer.createTransport({
            service: process.env.MAIL_SERVICE,
            auth: {
                user: process.env.MAIL_USER_EMAIL,
                pass: process.env.MAIL_USER_PASSWORD
            }
        }).use('compaile',hbs(handlebarOptions)).sendMail(mailDetails, (error, info) => {
            if (error) {
                console.log(error.message, "error ");
            } else {
                console.log(`Email sent successfully: ${info.response}`);
            };
        });
    }else{
        mailDetails.text = details.text;
        nodemailer.createTransport({
            service: process.env.MAIL_SERVICE,
            auth: {
                user: process.env.MAIL_USER_EMAIL,
                pass: process.env.MAIL_USER_PASSWORD
            }
        }).sendMail(mailDetails, (error, info) => {
            if (error) {
                console.log(error.message, "error ");
            } else {
                console.log(`Email sent successfully: ${info.response}`);
            };
        });
    }
     
}
export   {
    sendEmail
}