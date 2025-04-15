import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const ObjectData = {}

function cartModel(suffix) {
    const cartSchema = mongoose.Schema({
        user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        productDetails: [{
            id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
            amount: { type: Number, min: [0, 'Too few eggs'], default: 0 },
            size: { type: String, default: null },
            color: { type: String, default: null },
            quantity: { type: Number, min: [0, 'Too few eggs'], default: 0 }
        }],
        totalQuantity: { type: Number, min: [0, 'Too few eggs'], default: 0 },
        isOrdered: { type: Boolean, default: false },
        status: {
            cartStatus: { type: Number, default: 0 },
        },
        // discount: { type: Number, default: 0.00 },
        // discount_description: { type: Array, default: null },
        totalAmount: { type: Number, min: [0, 'Too few eggs'], default: 0 },
        // isProduct: { type: Boolean, default: true },
    }, { timestamps: true }); 
    return mongoose.model('cart_' + suffix, orderSchema);
}

function cart(prefix) {
    if (!ObjectData[prefix]) {
        ObjectData[prefix] = new cartModel(prefix)
    }
    return ObjectData[prefix]
}

export default cart; 