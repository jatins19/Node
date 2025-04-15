import User from '../models/authModel.js'
import jwt from 'jsonwebtoken'
import validation from '../validation/authValidation.js';
import bcrypt from 'bcrypt'
import Joi from 'joi';
import { sendEmail } from '../config/mail.js'
import crypto from 'crypto'
import roleSchema from '../../superAdmin/models/roleModel.js'
import permissiomSchema from '../../superAdmin/models/permissionModel.js'
import paymentMethodSchema from '../../payment_integration/models/paymentModel.js'
import { populate } from 'dotenv';

// Utility function to validate email
const isEmail = (string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(string);
};

// Utility function to validate phone number
const isPhoneNumber = (string) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/; // Simple international phone number validation
    return phoneRegex.test(string);
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body; 
        var login;
        if (isEmail(username)) {
            login = await User.findOne({ email: username }).populate({ path: 'role', populate:{ path:'permission' }}).populate({path:'method_id',select:'_id method status'});
        } else if (isPhoneNumber(username)) {
            login = await User.findOne({ phone: username }).populate({ path: 'role', populate:{ path:'permission' }}).populate({path:'method_id',select:'_id method status'});;
        } else {
            login = await User.findOne({ username: username }).populate({ path: 'role', populate:{ path:'permission' }}).populate({path:'method_id',select:'_id method status'});;
        }
        if (!login) {
            return res.status(401).json({ status: false, errors: "Account doesn't exists, please check your email." });
        };
        const isMatched = await login.isPasswordMatch(password);
        if (isMatched) {
            const token = jwt.sign(
                { _id: login._id,role:login?.role?.name ? login?.role?.name : 'superAdmin' },
                process.env.TOKEN_KEY,
                { expiresIn: "24h" }
            );
            login.token = token;
            const loginObj = login.toObject();
            delete loginObj.password;
            return res.status(200).json({ status: true, message: "Login Successfully", data: loginObj });
        } else {
            return res.status(401).json({ status: false, message: "Invalid  credentials" });
        };
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: "Something Went Wrong" });
    };
}

const signup = async (req, res) => {
    try {
        let flag = false;
        // const role = req.query.role;
        const direct = req.body.direct;
        var { email, username, first_name, last_name, phone_number, dob, address, country_code } = req.body;
        console.log(req.body.password, "req.body.password");
        // const password = await bcrypt.hash(req.body.password, 10);
        // console.log(password, "Hash Pssworddddd");
        var newUser = { first_name, last_name, dob, address, country_code };
        if (email && email != null) {
            flag = true;
            const exist = await User.findOne({ email: email.toLowerCase().trim() });
            if (exist) {
                return res.status(422).json({ "status": false, "message": "Email already exists" });
            };
            newUser.email = email.toLowerCase().trim(); 
        }
        if (username && username != null) {
            flag = true;
            const exist = await User.findOne({ username: username });
            if (exist) {
                return res.status(422).json({ "status": false, "message": "username already exists" });
            };
            newUser.username = username;
        }
        if (phone_number && phone_number != null) {
            flag = true;
            const exist = await User.findOne({ phone_number: phone_number });
            if (exist) {
                return res.status(422).json({ "status": false, "message": "phone_number already exists" });
            };
            newUser.phone_number = phone_number;
        }
        if (flag == false) {
            return res.status(422).json({ "status": false, "message": "Please Provide Valid Details" });
        }
         
            newUser.role = process.env.USER_ROLE;
         

        let userDetails = await User.create(newUser);
        if (direct == true || direct == 'true') {
            var token = jwt.sign(
                { _id: userDetails._id },
                process.env.TOKEN_KEY,
                { expiresIn: "1h" }
            );
        }
        // const new_password = { password: password };
        // Object.assign(userDetails, new_password); 
        Object.assign(userDetails, { password: req.body.password })
        await userDetails.save();
        userDetails.token = token;
        delete userDetails?.password;
        return res.status(200).json({ status: true, message: "User registered successfully", data: direct == true || direct == 'true' ? userDetails : {} });
    } catch (error) {
        console.error(error.message);
        console.log(error);
        return res.status(500).json({ status: false, message: "Something Went Wrong" });
    };
}

const forgatPassword = async (req, res) => {
    try {
        const { username } = req.body; 
        const type = req?.params?.type;
        var user;
        let toMail = false;
        if (isEmail(username)) {
            toMail = true;
            user = await User.findOne({ email: username });
        } else if (isPhoneNumber(username)) {
            user = await User.findOne({ phone_number: username });
        } else {
            return res.status(404).json({ status:false,message: 'Not A Valid credential' });
        }

        if (!user) {
            return res.status(404).json({ status:false,message: 'User not found' });
        }
        await user.save();
        if (type == 'otp') {
            var otp = await generateOTP()
            const otpExpiration = Date.now() + 600000; // Token expires in 10 min 
            user.otp = otp;
            user.otpExpiration = otpExpiration;
            await user.save();
        } else {
            // Generate a unique token
            var resetToken = crypto.randomBytes(20).toString('hex');
            var resetTokenExpiration = Date.now() + 600000; // Token expires in 10 min 
            // Update user with the token and expiration
            user.resetToken = resetToken;
            user.resetTokenExpiration = resetTokenExpiration;
            await user.save();
        }

        if (toMail) {
            let details = {
                subject: 'Reset Password',
                email: username,
                text: type == 'otp' ? `Reset Password :-Your One Time Password is ${otp}` : `  'http://localhost:3000/#/reset-password?email=${username}&token=${resetToken},`
            }
            sendEmail(details);

        } else {
            // code for SMS Serivce
        }
        return res.status(200).json({ status: true, message: "Password reset instructions sent" })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: "Something Went Wrong" });
    };
}

const varifyOtp = async (req,res) => {
    try {
        const {username,otp} = req?.body;
        let user;
        if (isEmail(username)) { 
            user = await User.findOne({ email: username ,otp:parseInt(otp)});
        } else if (isPhoneNumber(username)) {
            user = await User.findOne({ phone_number: username,otp:parseInt(otp) });
        } else {
            return res.status(404).json({ status:false,message: 'Please Enter Correct OTP' });
        } 
        if(user?.otpExpiration < Date.now() || !user){
            return res.status(404).json({ status:false,message: 'OTP Expired' });
        } 
        await User.updateOne({_id:user?._id},{$set:{otp:null,otpExpiration:null}})
        return res.status(200).json({status:true,message :"OTP Varified"})
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: "Something Went Wrong" });
    }
}

const generateOTP = async () => {
    let digits = '0123456789';
    let OTP = '';
    let len = digits.length
    for (let i = 0; i < 6; i++) {
        OTP += digits[Math.floor(Math.random() * len)];
    }
    return OTP;
}

const resetPassword = async (req, res) => {
    try { 
        const { token } = req.query;
        const { password,username } = req.body;
        
        const byOTP = username ? true : false;
        
        var user;
        
        if(byOTP){
            if (isEmail(username)) { 
                user = await User.findOne({ email: username});
            } else if (isPhoneNumber(username)) {
                user = await User.findOne({ phone_number: username });
            } else {
                return res.status(404).json({ status:false,message: 'SomeThing Went Wrong' });
            } 
        }else{
            user = await User.findOne({
                resetToken: token,
                resetTokenExpiration: { $gt: Date.now() },
            });
        }

        if (!user) {
            return res.status(400).json({ message: 'Reset password Time expired' });
        };

        // const new_password = await bcrypt.hash(password, 10);
        const new_password = { password: password };
        Object.assign(user, new_password);
        user.resetToken = null;
        user.resetTokenExpiration = null;
        await user.save();  
        res.json({ status: true, message: 'Password reset successful' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: "Something Went Wrong" });
    };
}
export default {
    login,
    signup,
    forgatPassword,
    resetPassword,
    varifyOtp
}