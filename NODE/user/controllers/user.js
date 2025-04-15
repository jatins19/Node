// import User from '../models/userModel.js' 
import path from 'path'
import fs from 'fs'
import { cwd } from 'process';
import mongoose from 'mongoose';
// import jwt from 'jwt-simple';

const User = mongoose.model('User');
import Wishlist from '../models/wishlist.js';


const editProfile = async (req, res) => {
    try {
        var { email, username, first_name, last_name, phone_number, dob, address, country_code } = req.body;
        var user_data = await User.findOne({ _id: req.user._id });
        if (!user_data) {
            return res.status(422).json({ status: false, message: "Account does not exists" });
        };

        // let email_check = await User.findOne({ email: email, email: { $ne: null }, _id: { $ne: req.user._id } });
        // if (email_check) {
        //     return res.status(422).json({ status: false, message: "Email Already Exists" });
        // };

        let check_userName = await User.findOne({ user_name: username, username: { $ne: null }, _id: { $ne: req.user._id } });
        if (check_userName) {
            return res.status(422).json({ status: false, message: "User Name Already Exists" });
        };

        let check_phone = await User.findOne({ $or: [{ phone_number: phone_number, _id: { $ne: req.user._id } }], phone_number: { $ne: null } });
        if (check_phone) {
            return res.status(422).json({ status: false, message: "Phone No. Already Exists" });
        };

        const params = { first_name, last_name, email, username, phone_number, dob, address, country_code };
        if (req.file?.filename) {
            var PicturePath = 'profile_pic/' + req.file?.filename;
            params.profile_pic = PicturePath;

            if (user_data.profile_pic) {
                const filePath = path.join(cwd(), 'public', user_data.profile_pic);

                if (fs.existsSync(filePath)) {
                    await fs.unlink(filePath, (err) => {
                        if (err) { console.error(err) };
                    });
                };
            };
        };
        var userData = await User.findByIdAndUpdate(req.user._id, params, { new: true, lean: true });

        delete userData.password;
        delete userData.resetToken;
        delete userData.resetTokenExpiration;
        return res.status(200).json({ status: true, message: "Updated successfully", data: userData });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ status: false, error: "Something Went Wrong" });
    };
};

const passwordChange = async (req, res) => {
    try {
        // const errors = validationResult(req);
        // if (!errors.isEmpty()) {
        //     return res.status(422).json({ errors: errors.array(), status: false });
        // }
        var { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);
        if (user.password != null) {
            const isMatch = await user.isPasswordMatch(currentPassword);
            if (!isMatch) {
                return res.status(422).json({ status: false, message: "Old Password does not Match" });
            }
        };
        const hashPassword = { password: newPassword };
        Object.assign(user, hashPassword);
        await user.save();

        return res.status(200).json({ status: true, message: "Password Change Sucessfully." });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ status: false, error: "Something Went Wrong" });
    };
};

const myProfile = async (req, res) => {
    try {
        console.log("req.user");
        if (req.user._id) {
            var data = await User.findOne({ _id: req.user._id }).lean();
        };
        if (data.password != null) { delete data.password };
        delete data.resetToken;
        delete data.resetTokenExpiration;
        return res.status(200).json({ status: true, message: "Profile Info", data });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, error: "Something Went Wrong" });
    };
};

const singleUser = async (req, res) => {
    try {
        var data = await User.findOne({ _id: req.query.userId }).lean();
        if (!data) {
            return res.status(422).json({ status: false, message: "User not exist" });
        };
        delete data.password;
        delete data.resetToken;
        delete data.resetTokenExpiration;
        return res.status(200).json({ status: true, message: "User Detail", data });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ status: false, message: "Something Went Wrong." });
    };
};

const wishlist = async (req, res) => {
    try {
        const { id } = req?.body;
        let check = await Wishlist.findOne({ product_id: id });
        if (!check) {
            await Wishlist.create({ user_id: req.user._id, product_id: id });
        };
        return res.status(200).json({ status: true, message: "Added To Wishlist" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, error: "Something Went Wrong" });
    };
};

const userWishlist = async (req, res) => {
    try {
        const list = Wishlist.find({ user_id: req.user._id }, { user_id: 0 }).populate('product_id');
        return res.status(200).json({ status: true, message: "list", list });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, error: "Something Went Wrong" });
    };
};

const deleteWishlist = async (req, res) => {
    try {
        const id = req?.params?.id;
        Wishlist.deleteOne({ product_id: id });
        return res.status(200).json({ status: true, message: "Removed" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, error: "Something Went Wrong" });
    };
};

const getNotifications = async (req, res) => {
    try {
        // const 
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, error: "Something Went Wrong" });
    };
};

export default {
    editProfile,
    passwordChange,
    myProfile,
    singleUser,
    wishlist,
    userWishlist,
    deleteWishlist,
    getNotifications
}