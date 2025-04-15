import Product from '../models/productModel.js'
import User from '../../../auth/models/authModel.js'
import { sendEmail } from '../config/mail.js'
import mongoose from 'mongoose';

const create = async (req, res) => {
    try {
        // console.log(req.user, "usersssssss");
        if (req.user.role != "Admin") {
            return res.status(422).json({ status: false, message: "User are not authorized person to perform this action." })
        };

        // add code to check if admin id exist, if not throw error user or admin not found
        const admin = await User.findById(req.user._id);
        if (!admin) {
            return res.status(422).json({ status: false, message: "User/Admin not found" })
        };

        const { category, name, price, color, size, description, quantity, isExchangeable, isRefundable, isRepairable, sqNo, images } = req.body;
        // const 
        const params = {
            admin_id: req.user._id,
            name,
            price,
            color,
            size,
            category,
            description: description ?? null,
            quantity,
            isExchangeable,
            isRefundable,
            isRepairable,
            sqNo,
            images
        };

        if (req.files) {
            const productImage = req.files.map(file => `product_image/${file.filename}`);
            params.images = productImage;
        };

        const createProduct = await Product.create(params)

        return res.status(200).json({ status: true, message: "Product Created Successfully", data: createProduct });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ status: false, message: "Something Went Wrong" });
    };
};

const edit = async (req, res) => {
    console.log("working");
    try {
        const data = await Product.findById(req.body.product_id);
        if (!data) {
            return res.status(422).json({ status: false, message: "Product does not exist." });
        };
        const { name, price, color, size, description, quantity, isExchangeable, isRefundable, images } = req.body;

        const params = {
            name,
            price,
            color,
            size,
            category,
            description: description ?? null,
            quantity,
            isExchangeable,
            isRefundable,
            isRepairable,
            sqNo,
            images
        };

        const editProduct = await Product.findOneAndUpdate({ _id: req.body.product_id, admin_id: req.user._id, }, params, { new: true, lean: true });
        return res.status(200).json({ status: true, message: "Product Updated Successfully", data: editProduct });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ status: false, message: "Something Went Wrong" });
    };
};

const list = async (req, res) => {
    try {
        var data;
        if (req.user.role != "Admin") {
            data = await Product.find({});
        } else {
            data = await Product.find({ admin_id: req.user._id });
        }
        return res.status(200).json({ status: true, message: "Product List", data })
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ status: false, message: "Something Went Wrong" });
    };
};

const deleteProduct = async (req, res) => {
    try {
        const data = await Product.findById(req.query.product_id);
        if (!data) {
            return res.status(422).json({ status: false, message: "Product does not exist" });
        }
        await Product.deleteOne({ _id: req.query.product_id });
        return res.status(200).json({ status: true, message: "Product Deleted Successfully" });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ status: false, message: "Something Went Wrong" });
    };
};

const addMediaImages = async function (req, res) {
    try {
        var imagePaths;
        imagePaths = req.files.map(file => `item/image/${file.filename}`);
        return res.status(200).json({ "status": true, "path": imagePaths });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ status: false, error: "Something Went Wrong" });
    };
};

export default {
    create, list, deleteProduct, edit, addMediaImages
};