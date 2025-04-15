import mongoose from "mongoose";
import payment from "../../../payment_integration/controllers/payment.js";
const PaymentMethod = mongoose.model('payment_method');
const Plan = mongoose.model('plan');
const User = mongoose.model('User');
const Cart = mongoose.model('Cart');
const Order = mongoose.model('Order');

const checkout = async (req, res) => {
    try {
        let request = req.body; 
        let cart_details = await Cart.findOne({_id:request?.cart_id})
        let details = {
            active_method : request?.active_method,
            amount : request?.amount,
            customer_id : request?.customer_id,
        }
        let params= {
            user_id: req?.user?._id, 
            order_no: '001', 
            totalQuantity:cart_details?.totalQuantity ,
            cart_id: request?.cart_id,
            status: 0 ,
            // discount: , 
            totalAmount:cart_details?.totalAmount, 
        }
        let transaction = await payment(details);
        if(transaction){
            params.transaction_id = transaction.id;
        }else{
            return res.status(500).json({status:false,messgae:"Payment Method Not Acceptable"}) 
        }
      
        let order = await Order.create(params);
        if(order){
            await Cart.updateOne({_id:request?.cart_id},{'$set':{'status.cartStatus':1}})
            return res.status(200).json({status:false,messgae:"Order Place Successfull"})
        }else{
            return res.status(500).json({status:false,messgae:"SomeThing Went Wrong"})
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({status:false,messgae:"SomeThing Went Wrong"})
    }
}

const payment = async(payment_details)=>{
    try{
        let method = await PaymentMethod.findne({_id:payment_details?.active_method},{keys:1});
        let details = {
            keys : method?.keys,
            amount : payment_details?.amount,
            customer_id : payment_details?.customer_id,
            chiave_segreta:method?.chiave_segreta
        }
        if(method.method == 'paypal'){
            return result = await payment.paymentViaPaypal(details); 
        }else if(method.method == 'squareup'){
            return result = await payment.paymentViaSqureUp(details); 
        }else if(method.method == 'strip'){
            return result = await payment.paymentViaStrip(details); 
        }else{
            return false
        }
    }catch(error){
        return false;
    }
}

export default {
    checkout
}