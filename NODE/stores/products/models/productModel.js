import mongoose from 'mongoose';
import bcrypt from 'bcrypt'
const { Schema, model } = mongoose;

const productSchema = mongoose.Schema({
  admin_id: { type: Schema.Types.ObjectId, default: null, ref: 'User' },
  name: { type: String, required: true },
  color: { type: String, required: true },
  size: { type: String, default: null },
  isDeleted: { type: Boolean, default: false },
  parentProductId: { type: Schema.Types.ObjectId, default: null, ref: 'Product' },
  metaData: { type: String, default: null },
  sqNo: { type: String, required: true, unique: true },
  isVarient: { type: Boolean, default: false },
  category: { type: String, required: true },
  price: { type: Number, default: 0 },
  description: { type: String, default: null },
  quantity: { type: Number, default: 0 },
  isExchangeable: { type: Boolean, default: false },
  isRefundable: { type: Boolean, default: false },
  isRepairable: { type: Boolean, default: false },
  images: [{ type: String, default: null }]
});

const Product = mongoose.model("Product", productSchema);
export default Product;
// export default model('Product', productSchema);