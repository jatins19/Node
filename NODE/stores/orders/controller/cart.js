import cart from '../models/cartModel.js';
import product from '../../products/models/productModel.js';

const addProduct = async (req, res) => {
    try {
        const { product_id, quantity, size, color } = req.body;
        const productData = await product.findOne({ _id: product_id, isDeleted: false });
        if (!productData) {
            return res.status(422).json({ status: false, message: "Product not found." });
        };
        if (productData.quantity <= 0 || productData.quantity < quantity) {
            return res.status(422).json({ status: false, message: "Product is out of Stock." });
        };

        const checkCart = await cart.findOne({ user_id: req.user._id, "productDetails.id": product_id });

        // condition ----> if product is already added in the cart update the existing product
        if (checkCart) {
            // has to check, correct & complete the code........
            checkCart.productDetails.forEach(async (product) => {
                if (product.id == product_id) {
                    product.quantity = product.quantity + quantity;
                    product.amount = product.quantity * productData.price;
                };
            });
            var data1 = await checkCart.save();
        } else {
            var totalAmount = quantity * productData.price;
            var totalQuantity = quantity;
            let params = {
                id: product_id,
                amount: totalAmount,
                size: size,
                color: color,
                quantity: quantity
            };

            var data1 = await cart.findOneAndUpdate(
                { user_id: req.user._id },
                { user_id: req.user._id, $push: { productDetails: params }, totalQuantity: totalQuantity, totalAmount: totalAmount },
                { upsert: true, new: true, lean: true });
        };

        let sum = 0;
        let q = 0;
        if (data1) {
            data1.productDetails.forEach(item => {
                sum += item.amount;
                q += item.quantity;
            });
            totalAmount = sum;
            totalQuantity = q;
        };

        const data = await cart.findOneAndUpdate({ _id: data1._id, isOrdered: false }, { totalQuantity: totalQuantity, totalAmount: totalAmount }, { new: true, lean: true });

        res.status(200).json({ status: true, message: "Cart Created/updated", data });
        // };
    } catch (error) {
        console.log("error:", error);
        res.status(500).json({ status: false, error });
    };
};

const cartList = async (req, res) => {
    try {
        const data = await cart.findOne({ user_id: req.user._id, isOrdered: false });
        if (!data) {
            return res.status(422).json({ status: false, message: "No item's in the Cart." });
        };
        return res.status(200).json({ status: true, message: "Cart Data", data });
    } catch (error) {
        console.log("error:", error.message);
        res.status(500).json({ status: false, error: error });
    };
};

const updateCart = async () => {
    try {
        const { cart_id, product_id, quantity } = req.body
        const data = await cart.findById(cart_id);

        const productData = await product.findById(product_id);

        data.productDetails.forEach(product => {
            product.quantity = quantity;
            product.amount = quantity * productData.amount;
        });

        const data1 = await data.save().new();

        let sum = 0;
        let q = 0;
        if (data1) {
            data1.productDetails.forEach(item => {
                sum += item.amount;
                q += item.quantity;
            });
            totalAmount = sum;
            totalQuantity = q;
        };

        const fd = await cart.findOneAndUpdate({ _id: cart_id, isOrdered: false }, { totalQuantity: totalQuantity, totalAmount: totalAmount }, { new: true, lean: true });

        return res.status(200).json({ status: true, message: "Cart Updated Successfully.", data: fd })
    } catch (error) {
        console.log("error:", error.message);
        res.status(500).json({ status: false, error: error });
    };
};

// Not Tested...............
const deleteCart = async (req, res) => { 
    try {
        const { cart, cart_id, product_id } = req.query;
        const cartData = await cart.findOne({ _id: cart_id, isOrdered: false });
        if (!cartData) {
            return res.status(500).json({ status: false, message: "cart not created." });
        };
        // Check want to delete full cart or any specific Product..........
        if (cart == "true") {
            // Delete FUll Cart.....
            await cart.deleteOne({ _id: cart_id, user_id: req.user._id, isOrdered: false });
            return res.status(200).json({ status: true, message: "Cart Deleted." });
        } else {
            // delete single item's
            let indexToRemove = cartData.productDetails.findIndex(obj => obj.id === product_id);

            if (indexToRemove !== -1) {
                cartData.productDetails.splice(indexToRemove, 1);
            };
            await cartData.save();

            // update cart total and quantity.......
            const newCart = await cart.findById(cart_id);
            let tAmount = 0;
            let tQuantity = 0;
            const arr = newCart.productDetails;
            arr.forEach(products => {
                tAmount += products.amount;
                tQuantity += products.quantity;
            });

            const finalCart = await cart.findOneAndUpdate(
                { _id: cart_id, user_id: req.user._id, isOrdered: false },
                { totalQuantity: tQuantity, totalAmount: tAmount }, { new: true, lean: true });

            return res.status(200).json({ status: true, message: "Product Removed Successfully.", data: finalCart });
        };
    } catch (error) {
        console.log("error:", error.message);
        res.status(500).json({ status: false, error: error });
    };
};

export default { addProduct, cartList, updateCart, deleteCart };