const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  images: [String], // Array of image URLs
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  description: { type: String },
  stock: { type: Number, required: true, default: 0 } // Added stock field
});

// Prevent model overwriting
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

module.exports = Product;
