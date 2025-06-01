const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
    productID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", // Reference to Product model
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String ,// Assuming it's a URL
        required:true
    },
    cartId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cart", // Reference to Cart model
        required: true
    },
    quantity: {
        type: Number,
        default: 1, // Default quantity to 1 when added
        min: 1
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const CartItem = mongoose.model("CartItem", cartItemSchema);
module.exports = CartItem;
