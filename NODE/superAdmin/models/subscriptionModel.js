import mongoose from 'mongoose';
import bcrypt from 'bcrypt'
const { Schema, model } = mongoose;

const planSchema = mongoose.Schema({
  plan_name: { type: String, required: true },
  duration: { type: Number, required: true },
  price: { type: Number, required: true },
  type: { type: String,required: true }, 
});

 

const plan = mongoose.model("plan", planSchema);
export default plan;
// export default model('User', userSchema);