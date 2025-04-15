import Joi from 'joi';

const createProduct = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().required(),
    color: Joi.string(),
    size: Joi.string(),
    sqNo: Joi.string().required(),
    category: Joi.string().required(),
    description: Joi.string().required(),
    quantity: Joi.number().required().min(1),
    isExchangeable: Joi.boolean(),
    isRefundable: Joi.boolean(),
    isRepairable: Joi.boolean(),
});

const listProduct = Joi.object({});

const deleteProduct = Joi.object({
    product_id: Joi.string()
});

const editProduct = Joi.object({
    name: Joi.string(),
    price: Joi.number(),
    color: Joi.string(),
    size: Joi.string(),
    description: Joi.string(),
    quantity: Joi.number().required().min(1),
    isExchangeable: Joi.boolean(),
    isRefundable: Joi.boolean(),
    product_id: Joi.string()
});

export default {
    createProduct, listProduct, deleteProduct, editProduct
}