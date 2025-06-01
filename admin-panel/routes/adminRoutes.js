const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Category = require("../models/Category");

// Get Dashboard Data
router.get("/dashboard", async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const totalCategories = await Category.countDocuments();
        res.json({ totalProducts, totalCategories });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// Add Product
router.post("/products", async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: "Error adding product" });
    }
});

// Get All Products
router.get("/products", async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: "Error fetching products" });
    }
});


module.exports = router;
