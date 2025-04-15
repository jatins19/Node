import Joi from 'joi';


const adminValidate = Joi.object({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    dob: Joi.string().required(),
    address: Joi.string().required(),
    email: Joi.string().email().required(),
    phone_number: Joi.number().required(),
    country_code: Joi.string().required(),
    password: Joi.string().required().min(8).required(),
})

const adminDeleteValidation = Joi.object().keys({
    params: {
        id: Joi.string().required()
    }
})

const paymentMethodValidation = Joi.object({
    id: Joi.string().required(),
    method_id: Joi.array().required()
})

const subscriptionValidation = Joi.object({
    plan_name: Joi.string().required(),
    duration: Joi.number().required(),
    price: Joi.number().required(),
    type: Joi.string().required(),
})

const addCategory = Joi.object({
    name:Joi.string().required(),
    sub_type :Joi.array().items().allow(),
    parent_id:Joi.string().required(),
})

export default {
    adminValidate, adminDeleteValidation, paymentMethodValidation,subscriptionValidation,
    addCategory
}