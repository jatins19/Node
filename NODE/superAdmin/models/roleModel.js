import mongoose from 'mongoose'; 
const { Schema, model } = mongoose;

const roleSchema = mongoose.Schema({
    name: { type: String,required:true },
    permission: {
        type: [{ type: Schema.Types.ObjectId, ref: 'permission' }],  // Array of ObjectId
        required: true
      }
}); 

const role = mongoose.model("role", roleSchema);
export default role;
// export default {}