import Joi from 'joi';

const loginValidate = Joi.object({
    username: Joi.string().email().required(),
    password: Joi.string().required().min(8),
})

const signupValidate = Joi.object({
    first_name: Joi.string(),
    last_name: Joi.string(),
    dob: Joi.string(),
    address: Joi.string(),
    email: Joi.string().email(),
    phone_number: Joi.number(),
    country_code: Joi.string(),
    username: Joi.string(),
    password: Joi.string().required().min(8),
    direct: Joi.boolean()
})

const forgotValidate = Joi.object({ username: Joi.string().required() });

const resetPasswordValidate = Joi.object({ password: Joi.string().required().min(8), username: Joi.string() });

const tokenValidate = Joi.object();

export default {
    loginValidate,
    signupValidate,
    forgotValidate,
    resetPasswordValidate,
    tokenValidate
}