import nodemailer from 'nodemailer'
import hbs from 'nodemailer-express-handlebars';
import path from 'path';
import { configDotenv } from 'dotenv';
configDotenv();
const { MAIL_SERVICE, MAIL_USER_EMAIL, MAIL_USER_PASSWORD, MAIL_HOST, MAIL_PORT } = process.env;
const handlebarOptions = {
    viewEngine: {
        partialsDir: path.resolve('./views/'),
        defaultLayout: false,
    },
    viewPath: path.resolve('./views/'),
};

const mailTransporter = nodemailer.createTransport({
    service: MAIL_SERVICE,
    auth: {
        user: MAIL_USER_EMAIL,
        pass: MAIL_USER_PASSWORD
    }
}).use('compile', hbs(handlebarOptions));

const mailTransporters = nodemailer.createTransport({
    service: MAIL_SERVICE,
    auth: {
        user: MAIL_USER_EMAIL,
        pass: MAIL_USER_PASSWORD
    }
})

export default {
    mailTransporter,
    mailTransporters,
}
