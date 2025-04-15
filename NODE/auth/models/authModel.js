import mongoose from 'mongoose';
import bcrypt from 'bcrypt'
const { Schema, model } = mongoose;

const userSchema = mongoose.Schema({
  first_name: { type: String, default: null },
  createdBy: { type: Schema.Types.ObjectId, ref: 'user' },
  last_name: { type: String, default: null },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  dob: { type: Date, default: null },
  address: { type: String, default: null },
  phone_number: { type: Number, default: null },
  country_code: { type: String, default: null },
  role: { type: Schema.Types.ObjectId, ref: 'role' },
  method_id: {
    type: [{ type: Schema.Types.ObjectId, ref: 'payment_method' }],
  },
  active_method: {
    type: [{ type: Schema.Types.ObjectId, ref: 'payment_method' }],
  },
  token: { type: String },
  username: { type: String },
  resetToken: { type: String, default: null },
  resetTokenExpiration: { type: String, default: null },
  otp: { type: Number, default: null },
  otpExpiration: { type: Number, default: null },
  profile_pic: { type: String, default: null },
  plan_id: { type: Schema.Types.ObjectId, default: null, ref: 'plan' },
  plan_activate_date: { type: Date, default: null },
  plan_status: { type: Boolean, default: false },
  plan_exp: { type: Date, default: null },
  customer_id: { type: String, default: null },
  plan_transaction_id: { type: String, default: null }
});

userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return await bcrypt.compare(password, user.password);
};

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});

const User = mongoose.model("User", userSchema);
export default User;
// export default model('User', userSchema);