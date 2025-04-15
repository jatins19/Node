// import mongoose from 'mongoose';
// import bcrypt from 'bcrypt'
// const { Schema, model } = mongoose;

// const userSchema = mongoose.Schema({
//   first_name: { type: String, default: null },
//   last_name: { type: String, default: null },
//   email: { type: String, required: true, unique: true },
//   password: { type: String },
//   dob: { type: Date, default: null },
//   address: { type: String, default: null },
//   phone_number: { type: Number, default: null },
//   country_code: { type: String, default: null },
//   role: { type: String },
//   token: { type: String },
//   username: { type: String },
//   resetToken: { type: String, default: null },
//   resetTokenExpiration: { type: String, default: null },
//   profile_pic: { type: String, default: null }
// });

// userSchema.methods.isPasswordMatch = async function (password) {
//   const user = this;
//   return await bcrypt.compare(password, user.password);
// };

// userSchema.pre("save", async function (next) {
//   const user = this;
//   if (user.isModified("password")) {
//     user.password = await bcrypt.hash(user.password, 10);
//   }
//   next();
// });

// const User = mongoose.model("User", userSchema);
// export default User;
export default {}