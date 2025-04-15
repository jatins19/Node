import Joi from 'joi';

const addAddress = Joi.object({
    country: Joi.string(),
    country_code: Joi.string(),
    state: Joi.string(),
    state_code: Joi.string(),
    city: Joi.string(),
    nickname: Joi.string(),
    apt: Joi.string(),
    street: Joi.string(),
    postal_code: Joi.string(),
    is_primary: Joi.boolean(),
    instruction: Joi.string(),
    lat: Joi.string(),
    lng: Joi.string()
});

const deleteAddress = Joi.object({});

const getAddress = Joi.object({});

export default {
    addAddress, deleteAddress, getAddress
}