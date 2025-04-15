import mongoose from "mongoose";
const { Schema, model } = mongoose;

const paymentMethodSchema = mongoose.Schema({
    method: { type: String, required: true },
    status: { type: Boolean, required: true },
    keys: { type: Object, required: true },
    chiave_segreta: { type: String, required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: true
});

const paymentMethod = mongoose.model("payment_method", paymentMethodSchema);
export default paymentMethod; 