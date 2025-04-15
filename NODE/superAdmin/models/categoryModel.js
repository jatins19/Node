import mongoose from 'mongoose'; 
const { Schema, model } = mongoose;

const categorySchema = mongoose.Schema({ 
  name: { type: String, required: true },  
  parent_id:{type: Schema.Types.ObjectId, ref: 'Category',default:null},
  image: { type: String,default:null }, 
});

const Category = mongoose.model("Category", categorySchema);
export default Category;
// export default model('Product', productSchema);