import mongoose from 'mongoose'; 
const PaymentMethod = mongoose.model('payment_method'); 
const Plan = mongoose.model('plan');
const User = mongoose.model('User');
import payment from "../../payment_integration/controllers/payment.js"; 

const subscriptionCharges = async(req,res)=>{
    try {
        let request = req.body;
        let method = await PaymentMethod.findne({_id:request?.payment_method},{keys:1})
        let planDetails = await Plan.findne({_id:request?.plan_id});
        let details = {
            keys : method?.keys,
            amount : planDetails.price,
            customer_id : request?.customer_id,
            chiave_segreta:method?.chiave_segreta
        }
        if(method.method == 'paypal'){
            result = await payment.paymentViaPaypal(details); 
        }else if(method.method == 'squareup'){
            result = await payment.paymentViaSqureUp(details); 
        }else if(method.method == 'strip'){
            result = await payment.paymentViaStrip(details); 
        }else{
            return res.status(500).json({status:false,messgae:"Payment Method Not Acceptable"})
        }
        if(result){
            await User.updateOne({_id:req?.user?._id},{$set:{plan_transaction_id:result?.id,customer_id:request?.customer_id}})
            return res.status(200).json({status:false,messgae:"Payment Successfull"})
        }else{
            return res.status(500).json({status:false,messgae:"SomeThing Went Wrong"})
        }
    } catch (error) {
         console.log(error)
        return res.status(500).json({status:false,messgae:"SomeThing Went Wrong"})
    }
} 

const paymentActivation = async(req,res)=>{
    try{
        const {ids} = req?.body;
        let array = [];
        ids.map((item)=>{
            array.push(new mongoose.Types.ObjectId(item))
        }) 
        await User.updateOne({_id:req?.user?._id},{'$set':{active_method :array}})
        return res.status(200).json({status:false,messgae:"Activated"});
    }catch(error){
        console.log(error)
        return res.status(500).json({status:false,messgae:"SomeThing Went Wrong"})
    }
}
 

export default {
    subscriptionCharges, 
    paymentActivation,
}