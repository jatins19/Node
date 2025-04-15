import mongoose from 'mongoose';
import bcrypt from 'bcrypt'
const { Schema, model } = mongoose;

const addressSchema = mongoose.Schema({
    customer_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    country: { type: String, default: null },
    country_code: { type: String, default: null },
    state: { type: String, default: null },
    state_code: { type: String, default: null },
    city: { type: String, default: null },
    nickname: { type: String, default: null },
    apt: { type: String, default: null },
    street: { type: String, default: null },
    postal_code: { type: String, default: null },
    is_primary: { type: Boolean, default: false },
    instruction: { type: String, default: null },
    default: { type: Boolean, default: false },
    lat: { type: String, default: null },
    lng: { type: String, default: null },
});

const Address = mongoose.model("Address", addressSchema);
export default Address;