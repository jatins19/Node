import Joi   from 'joi';

 
const paymentMethodValidate = Joi.object({
    method:Joi.string().required(),
    status:Joi.boolean().required(),
    keys:Joi.object({
        publicKey : Joi.string().required(),
        secretKey : Joi.string().required()
    }).required(),
    user_id:Joi.string()
})  

export default {
    paymentMethodValidate 
}