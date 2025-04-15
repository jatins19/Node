import mongoose from 'mongoose'; 
const { Schema, model } = mongoose;

const wishlistSchema = mongoose.Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    product_id: { type: Schema.Types.ObjectId, ref: 'Product', default: [] } 
});

const Wishlist = mongoose.model("wishlist", wishlistSchema);
export default Wishlist;