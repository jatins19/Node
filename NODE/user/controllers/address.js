// import User from '../models/userModel.js'
import { cwd } from 'process';
import Address from '../models/addressModel.js'
// import jwt from 'jwt-simple';

const addAddress = async (req, res) => {
    try {
        const { country, country_code, state, state_code, city, nickname, apt, street, postal_code, is_primary, instruction, lat, lng } = req.body;

        const params = { customer_id: req.user._id, country, country_code, state, state_code, city, nickname, apt, street, postal_code, is_primary, instruction, lat, lng };

        const address = await Address.create(params);

        res.status(200).json({ status: true, message: "Address added successfully.", data: address });
    } catch (error) {
        console.log("error:", error.message);
        res.status(500).json({ status: false, message: "Something went wrong." });
    };
};

const editAddress = async (req, res) => {
    try {
        const { address_id } = req.params;
        const { country, country_code, state, state_code, city, nickname, apt, street, postal_code, is_primary, instruction, lat, lng } = req.body;

        const params = { country, country_code, state, state_code, city, nickname, apt, street, postal_code, is_primary, instruction, lat, lng };

        const address = await Address.findByIdAndUpdate(address_id, params, { new: true, lean: true });

        if (!address) {
            return res.status(422).json({ status: false, message: "No such Address Found." })
        };

        res.status(200).json({ status: true, message: "Address Updated.", data: address });
    } catch (error) {
        console.log("error:", error.message);
        res.status(500).json({ status: false, message: "Something went wrong." });
    };
};

const deleteAddress = async (req, res) => {
    try {
        const { address_id } = req.params;
        await Address.deleteOne({ _id: address_id });
        res.status(200).json({ status: true, message: "Address Deleted Successfully." });
    } catch (error) {
        console.log("error:", error.message);
        res.status(500).json({ status: false, message: "Something went wrong." });
    };
};

const getAddress = async (req, res) => {
    try {
        const { address_id } = req.params;
        const addresses = await Address.find({ customer_id: req.user._id });
        res.status(200).json({ status: true, message: "Address List", data: addresses });
    } catch (error) {
        console.log("error:", error.message);
        res.status(500).json({ status: false, message: "Something went wrong." });
    };
};

export default {
    addAddress, editAddress, deleteAddress, getAddress
}