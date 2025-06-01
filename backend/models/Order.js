const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

const generateOrderID = () => {
    return "ORD-" + nanoid(8); // Example: ORD-1A2B3C4D
};

const orderSchema = new mongoose.Schema({
    orderID: { type: String, default: generateOrderID, unique: true, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // 🔹 Added userId reference
    name: String,
    address: String,
    pincode: String,
    city: String,
    state: String,
    cartItems: [
        {
            productID: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
            name: String,
            quantity: Number,
            price: Number,
        },
    ],
    totalAmount: Number,
    paymentMethod: String,
    status: { type: String, default: "Pending" },
    orderDate: { type: Date, default: Date.now }
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
