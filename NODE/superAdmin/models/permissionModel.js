import mongoose from 'mongoose'; 
const { Schema, model } = mongoose;

const permissiomSchema = mongoose.Schema({
    module_name: { type: String,required:true },
    view: { type: Boolean,required:true },
    edit: { type: Boolean,required:true },
    delete: { type: Boolean,required:true },
    add: { type: Boolean,required:true },
    access: { type: Boolean,required:true },
    role_id: { type:  Schema.Types.ObjectId, ref: 'roles', required: true }
}); 

const permission = mongoose.model("permission", permissiomSchema);
export default permission;
// export default {}