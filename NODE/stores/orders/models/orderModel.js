import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const ObjectData = {}

function orderModel(suffix) {
    const orderSchema = mongoose.Schema({
        user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        transaction_id: { type: String, default: null },
        order_no: { type: String, default: null },
        totalQuantity: { type: Number, min: [0, 'Too few eggs'], default: 0 },
        cart_id: { type: Schema.Types.ObjectId, ref: 'Cart', required: true },
        status: { type: Number, default: 0 },
        // discount: { type: Number, default: 0.00 }, 
        totalAmount: { type: Number, min: [0, 'Too few eggs'], default: 0 },
    }, { timestamps: true });  
    return mongoose.model('order_' + suffix, orderSchema);
}

function order(prefix) {
    if (!ObjectData[prefix]) {
        ObjectData[prefix] = new orderModel(prefix)
    }
    return ObjectData[prefix]
}

export default order; 