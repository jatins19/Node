import Joi from 'joi';

const editUserValidate = Joi.object({
    first_name: Joi.string(),
    last_name: Joi.string(),
    dob: Joi.string(),
    address: Joi.string(),
    email: Joi.string().email(),
    phone_number: Joi.number(),
    country_code: Joi.string(),
    username: Joi.string(),
    profile_pic:Joi.string(),
})

const getUserValidate = Joi.object();

const changePasswordValidate = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().required().min(8)
});

export default {
    editUserValidate,
    getUserValidate,
    changePasswordValidate
}