import Joi   from 'joi';

 
const subscriptionCharges = Joi.object({
    payment_method : Joi.string().required(),
    customer_id : Joi.string().required(),
    plan_id:Joi.string().required()
})
 
 
// const paymentActivation = Joi.object().keys({
//     params: {
//         id: Joi.string().required()
//     }
// })

const paymentActivation = Joi.object({
    ids : Joi.array().required(), 
})
export default {
    subscriptionCharges,
    paymentActivation
}