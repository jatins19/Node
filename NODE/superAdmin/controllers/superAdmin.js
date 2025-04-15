import plan from '../models/subscriptionModel.js'
import mongoose from 'mongoose';
import Category from '../models/categoryModel.js'
import path from 'path'
import { cwd } from 'process';
import fs from 'fs'
import { log } from 'console';
const User = mongoose.model('User');
// const Product = mongoose.model('Product');
import Product from '../../stores/products/models/productModel.js';
import { configDotenv } from 'dotenv';
configDotenv();
const { FRONTEND_URL, MAIL_FROM } = process.env;
import MAIL from '../config/mail.js';
import crypto from 'crypto';

const addSubscription = async (req, res) => {
    try {
        const { plan_name, duration, price, type } = req.body;
        let status = await plan.create({
            plan_name, duration, price, type
        })
        if (type == 'user') {
            await User.updateOne({ _id: req?.user?._id }, { '$set': { plan_id: status?._id, plan_activate_date: new Date(), plan_status: true, plan_exp: new Date(new Date().setMonth(new Date().getMonth() + duration)) } })
        } // add more function according to requirements
        if (status) {
            return res.status(200).json({ status: true, message: "Plan Created Successfully", data: status?._id?.toString() });
        } else {
            return res.status(401).json({ status: false, message: "Something Went Wrong" });
        };
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: "Something Went Wrong" });
    };
};

const viewSubscription = async (req, res) => {
    try {
        const id = req.params.id;
        var plan_data = await plan.findOne({ _id: id });
        if (!plan_data) {
            return res.status(422).json({ status: false, message: "Plan does not exists" });
        };
        return res.status(200).json({ status: true, message: "Plan Details", data: plan_data });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ status: false, error: "Something Went Wrong" });
    };
};

const updateSubscription = async (req, res) => {
    try {
        const id = req.params.id;
        const { plan_name, duration, price, type } = req.body;
        var plan_data = await plan.findOne({ _id: id });
        if (!plan_data) {
            return res.status(422).json({ status: false, message: "Plan does not exists" });
        };
        var plan_name_check = await plan.findOne({ plan_name: plan_name, _id: { $ne: id } });
        if (plan_name_check) {
            return res.status(422).json({ status: false, message: "Plan Name Already exists" });
        };
        const params = { plan_name, duration, price, type };

        var update = await plan.findByIdAndUpdate(id, params, { new: true, lean: true });
        return res.status(200).json({ status: true, message: " Plan Updated successfully", data: update });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ status: false, error: "Something Went Wrong" });
    };
};

const deleteSubscription = async (req, res) => {
    try {
        const id = req.params.id;
        var plan_data = await plan.findOne({ _id: id });
        if (!plan_data) {
            return res.status(422).json({ status: false, message: "Plan does not exists" });
        };

        await plan.deleteOne({ _id: id });
        return res.status(200).json({ status: true, message: "Delete successfully" });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ status: false, error: "Something Went Wrong" });
    };
};

const getList = async (req, res) => {
    try {
        let type = req.params.type;
        let list = await plan.find({ type: type });
        return res.status(200).json({ status: true, message: "Plan list", data: list });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: "Something Went Wrong" });
    };
};

// Admin Module
const addAdmin = async (req, res) => {
    try {
        let Request = req?.body;
        Request.email = Request?.email.toLowerCase().trim();
        Request.role = new mongoose.Types.ObjectId(process.env.ADMIN_ROLE);
        Request.createdBy = req.user._id;
        await User.create(Request);
        return res.status(200).json({ status: true, message: "Admin Added Successfull" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: "Something Went Wrong" });
    };
};

const viewAdmin = async (req, res) => {
    try {
        const id = req.params.id;
        var user_data = await User.findOne({ _id: id });
        if (!user_data) {
            return res.status(422).json({ status: false, message: "Admin does not exists" });
        };
        return res.status(200).json({ status: true, message: "Admin Details", data: user_data });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ status: false, error: "Something Went Wrong" });
    };
};

const adminList = async (req, res) => {
    try {
        let list = await User.find({ role: process.env.ADMIN_ROLE });
        return res.status(200).json({ status: true, message: "Admin List", list: list });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: "Something Went Wrong" });
    }
};

const updateAdmin = async (req, res) => {
    try {
        const id = req.params.id;
        var { email, first_name, last_name, phone_number, dob, address, country_code } = req.body;
        var user_data = await User.findOne({ _id: id });
        if (!user_data) {
            return res.status(422).json({ status: false, message: "Account does not exists" });
        };

        let check_email = await User.findOne({ $or: [{ email: email, _id: { $ne: id } }], email: { $ne: null } });
        if (check_email) {
            return res.status(422).json({ status: false, message: "Email Already Exists" });
        };

        let check_phone = await User.findOne({ $or: [{ phone_number: phone_number, _id: { $ne: id } }], phone_number: { $ne: null } });
        console.log(check_phone, "check_email");
        if (check_phone) {
            return res.status(422).json({ status: false, message: "Phone No. Already Exists" });
        };

        const params = { first_name, last_name, email, phone_number, dob, address, country_code };
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
            }
        };
        var userData = await User.findByIdAndUpdate(id, params, { new: true, lean: true });

        delete userData.password;
        delete userData.resetToken;
        delete userData.resetTokenExpiration;
        return res.status(200).json({ status: true, message: "Updated successfully", data: userData });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ status: false, error: "Something Went Wrong" });
    };
};

const deleteAdmin = async (req, res) => {
    try {
        const id = req.params.id;
        var user_data = await User.findOne({ _id: id });
        if (!user_data) {
            return res.status(422).json({ status: false, message: "Account does not exists" });
        };

        await User.deleteOne({ _id: id });
        return res.status(200).json({ status: true, message: "Delete successfully" });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ status: false, error: "Something Went Wrong" });
    };
};

const setPaymentMethod = async (req, res) => {
    try {
        const { id, method_id } = req.body;
        var user_data = await User.findOne({ _id: id });
        if (!user_data) {
            return res.status(422).json({ status: false, message: "Account does not exists" });
        };
        let ids = method_id.map(id => new mongoose.Types.ObjectId(id));
        await User.updateOne({ _id: id }, { $set: { method_id: ids } })
        return res.status(200).json({ status: true, message: "Update Successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: false, error: "Something Went Wrong" });
    };
};

// user module
const createUser = async (req, res) => {
    try {
        var { email, username, first_name, last_name, phone_number, dob, address, country_code } = req.body;
        var newUser = { first_name, last_name, dob, address, country_code };
        newUser.createdBy = req.user._id;
        if (email && email != null) {
            const exist = await User.findOne({ email: email.toLowerCase().trim() });
            if (exist) {
                return res.status(422).json({ status: false, message: "Email already exists" });
            };
            newUser.email = email.toLowerCase().trim();
        }
        if (username && username != null) {
            const exist = await User.findOne({ username: username });
            if (exist) {
                return res.status(422).json({ status: false, message: "username already exists" });
            };
            newUser.username = username;
        }
        if (phone_number && phone_number != null) {
            const exist = await User.findOne({ phone_number: phone_number });
            if (exist) {
                return res.status(422).json({ status: false, message: "phone_number already exists" });
            };
            newUser.phone_number = phone_number;
        };
        newUser.role = process.env.USER_ROLE;

        let userDetails = await User.create(newUser);

        Object.assign(userDetails, { password: "123456" })

        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiration = Date.now() + 3600000;

        userDetails.resetToken = resetToken;
        userDetails.resetTokenExpiration = resetTokenExpiration;
        await userDetails.save();

        let mailDetails = {
            from: { name: "Node Master", address: MAIL_FROM },
            to: email,
            subject: "Welcome to Our Site",
            template: "new_member",
            context: {
                name: first_name,
                email: email,
                restPasswordToken: resetToken,
                resetPasswordLink: `${FRONTEND_URL}/reset-password?email=${email}&token=${resetToken}&member=true`,
            },
        };

        MAIL.mailTransporter.sendMail(mailDetails, (error, info) => {
            if (error) {
                console.error("Error sending email:", error);
            } else {
                console.log("Email sent:", info.response);
            }
        });

        return res.status(200).json({ status: true, message: "User registered successfully", data: userDetails });
    } catch (error) {
        console.error(error.message);
        // console.log(error);
        return res.status(500).json({ status: false, message: "Something Went Wrong" });
    };
};

const editUser = async (req, res) => {
    try {
        var { email, username, first_name, last_name, phone_number, dob, address, country_code, user_id } = req.body;

        var newUser = { first_name, last_name, dob, address, country_code };
        if (email && email != null) {
            const exist = await User.findOne({ email: email.toLowerCase().trim(), _id: { $ne: user_id } });
            if (exist) {
                return res.status(422).json({ status: false, message: "Email already exists" });
            };
            newUser.email = email.toLowerCase().trim();
        }
        if (username && username != null) {
            const exist = await User.findOne({ username: username, _id: { $ne: user_id } });
            if (exist) {
                return res.status(422).json({ status: false, message: "username already exists" });
            };
            newUser.username = username;
        }
        if (phone_number && phone_number != null) {
            const exist = await User.findOne({ phone_number: phone_number, _id: { $ne: user_id } });
            if (exist) {
                return res.status(422).json({ status: false, message: "phone_number already exists" });
            };
            newUser.phone_number = phone_number;
        };
        // newUser.role = process.env.USER_ROLE;

        let userDetails = await User.findByIdAndUpdate(user_id, newUser, { new: true, lean: true });

        // Object.assign(userDetails, { password: req.body.password })
        // await userDetails.save();

        return res.status(200).json({ status: true, message: "User registered successfully", data: userDetails });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ status: false, message: "Something Went Wrong" });
    };
};

const getUser = async (req, res) => {
    try {
        let list = await User.find({ role: process.env.USER_ROLE });
        return res.status(200).json({ status: true, message: "User List", list: list });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: "Something Went Wrong" });
    }
};

const deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        var user_data = await User.findOne({ _id: id });
        if (!user_data) {
            return res.status(422).json({ status: false, message: "Account does not exists" });
        };

        await User.deleteOne({ _id: id });
        return res.status(200).json({ status: true, message: "User Delete Successfully" });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ status: false, error: "Something Went Wrong" });
    };
};

// category Api's
const getListCategory = async (req, res) => {
    try {
        let list = await Category.find({ parent_id: null }).lean();
        if (list?.length) {
            for (const element of list) {
                var data = await Category.find({ parent_id: element?._id }).lean();
                if (data?.length) {
                    for (const item of data) {
                        let result = await Category.find({ parent_id: item?._id })
                        if (result) {
                            item.sub_type = result;
                        }
                    }
                }
                element.subCatagory = data;
            }
        }
        return res.status(200).json({ status: true, message: "Category List", list: list });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ status: false, error: "Something Went Wrong" });
    };
};

const addCategory = async (req, res) => {
    try {
        const { name, sub_type, parent_id } = req.body;
        const check_category = await Category.findOne({ name: name });
        if (check_category) {
            return res.status(500).json({ status: false, message: "Category Already Exsist" });
        };
        if (req.file?.filename) {
            var PicturePath = 'category/' + req.file?.filename;
            var image = PicturePath;
        };
        let result = await Category.create({ name: name, image: image, parent_id: parent_id });
        if (sub_type?.length) {
            for (const item of sub_type) {
                await Category.create({ name: item, parent_id: result?._id });
            };
        };
        return res.status(200).json({ status: true, message: "Category Created Successfully" });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ status: false, error: "Something Went Wrong" });
    }
};

const viewCategory = async (req, res) => {
    try {
        const id = req.params.id;
        var data = await Category.findOne({ _id: id });
        if (!data) {
            return res.status(422).json({ status: false, message: "Category does not exists" });
        };
        return res.status(200).json({ status: true, message: "Category Details", data: data });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ status: false, error: "Something Went Wrong" });
    }
};

const viewCategoriesDetail = async (req, res) => {
    try {
        const id = req.params.id;
        let default_Category = await Category.findOne({ _id: id });
        var data = await Category.find({ parent_id: id }).lean();
        if (data?.length) {
            for (const item of data) {
                let result = await Category.find({ parent_id: item?._id })
                if (result) {
                    item.sub_type = result;
                }
            }
        }
        return res.status(200).json({ status: true, message: "Category Details", list: data, default_Category: default_Category });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ status: false, error: "Something Went Wrong" });
    }
};

const updateCategory = async (req, res) => {
    try {
        var { list, sub_type, sub_catagory, default_Category } = req.body;
        // var data = await Category.findOne({ _id: id });
        // if (!data) {
        //     return res.status(422).json({ status: false, message: "Category does not exists" });
        // };
        // let check_name = await Category.findOne({ $or: [{ name: name, _id: { $ne: id } }], name: { $ne: null } });
        // if (check_name) {
        //     return res.status(422).json({ status: false, message: "Category Already Exists" });
        // };
        // var update = await Category.findByIdAndUpdate(id, { name }, { new: true, lean: true });
        // if (sub_type?.length) {
        //     for (const item of sub_type) {
        //         await Category.create({ name: item, parent_id: new mongoose.Types.ObjectId(id) });
        //     }
        // }
        if (sub_catagory?.length) {
            for (const item of sub_catagory) {
                await Category.deleteMany({ parent_id: item })
                await Category.deleteOne({ _id: item });
            }
        }
        if (sub_type?.length) {
            for (const item of sub_type) {
                await Category.deleteOne({ _id: item });
            }
        }
        if (list?.length) {
            for (const item of list) {
                if (item?._id) {
                    await Category.findByIdAndUpdate(item?._id, { name: item?.name })
                    if (item?.sub_type?.length) {
                        for (const element of item?.sub_type) {
                            if (element?._id) {
                                await Category.findByIdAndUpdate(element?._id, { name: element?.name })
                            } else {
                                await Category.create({ name: element?.name, parent_id: item?._id });
                            }
                        }
                    }
                } else {
                    let result = await Category.create({ name: item?.name, parent_id: default_Category?._id });
                    if (item?.sub_type?.length) {
                        for (const element of item?.sub_type) {
                            await Category.create({ name: element?.name, parent_id: result?._id });
                        }
                    }
                }
            }
        }
        return res.status(200).json({ status: true, message: "Category Updated" });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ status: false, error: "Something Went Wrong" });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const id = req.params.id;
        var data = await Category.findOne({ _id: id, parent_id: { $ne: null } });
        if (!data) {
            return res.status(422).json({ status: false, message: "Category does not exists" });
        };

        await Category.deleteOne({ _id: id, parent_id: { $ne: null } });
        return res.status(200).json({ status: true, message: "Sub Type Deleted successfully" });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ status: false, error: "Something Went Wrong" });
    }
};

const deleteSubcategory = async (req, res) => {
    try {
        const id = req.params.id;
        var data = await Category.findOne({ _id: id });
        if (!data) {
            return res.status(422).json({ status: false, message: "Category does not exists" });
        };
        await Category.deleteMany({ parent_id: id })
        await Category.deleteOne({ _id: id });
        return res.status(200).json({ status: true, message: "Sub Category Deleted  successfully" });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ status: false, error: "Something Went Wrong" });
    }
};

// Products API
const createProducts = async (req, res) => {
    try {
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
        // if (req.files) {
        //     const productImage = req.files.map(file => `product_image/${file.filename}`);
        //     params.images = productImage;
        // };
        const createProduct = await Product.create(params);
        return res.status(200).json({ status: true, message: "New Product Created.", data: createProduct });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ status: false, message: "Something Went Wrong" });
    };
};

const editProducts = async (req, res) => {
    try {
        const { category, name, price, color, size, description, quantity, isExchangeable, isRefundable, isRepairable, sqNo, images, product_id } = req.body;
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
        const editProduct = await Product.findByIdAndUpdate(product_id, params, { new: true, lean: true });
        return res.status(200).json({ status: true, message: "Product Updated.", data: editProduct });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ status: false, message: "Something Went Wrong" });
    };
};

const listProduct = async (req, res) => {
    try {
        const list = await Product.find({ admin_id: req.user._id });
        if (!list || list.length <= 0) {
            return res.status(422).json({ status: false, message: "No Product Found." });
        };
        return res.status(200).json({ status: true, message: "Products List", data: list })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ status: false, message: "Somethong Went Wrong." });
    };
};

const singleProduct = async (req, res) => {
    try {
        const single = await Product.find({ _id: req.query.product_id });
        if (!single) {
            return res.status(422).json({ status: false, message: "No Product Found." });
        };
        return res.status(200).json({ status: true, message: "Products List", data: single })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ status: false, message: "Somethong Went Wrong." });
    };
};

const deleteProduct = async (req, res) => {
    try {
        const del = await Product.deleteOne({ _id: req.query.product_id });
        if (!del) {
            return res.status(422).json({ status: false, message: "No Product Found to delete." });
        };
        return res.status(200).json({ status: true, message: "Products Deleted." })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ status: false, message: "Somethong Went Wrong." });
    };
};

export default {
    addSubscription,
    viewSubscription,
    updateSubscription,
    deleteSubscription,
    getList,
    addAdmin,
    viewAdmin,
    adminList,
    updateAdmin,
    deleteAdmin,
    createUser,
    editUser,
    getUser,
    deleteUser,
    setPaymentMethod,
    getListCategory,
    addCategory,
    viewCategory,
    viewCategoriesDetail,
    deleteSubcategory,
    updateCategory,
    deleteCategory,
    createProducts,
    editProducts,
    listProduct,
    singleProduct,
    deleteProduct
};