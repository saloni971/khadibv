const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const Product = require("../models/Product");
const Category = require("../models/Category");
const User = require("../models/User");
const Order = require("../models/Order");
const CustomOrder = require('../models/Customization'); 
const Notification = require("../models/Notification");


// ✅ Define Upload Directory
const uploadDir = path.join(__dirname, "../../public/images");
console.log("Upload Directory:", uploadDir);

// ✅ Ensure Directory Exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Keep Only Filename in Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // ✅ Store only filename
    },
});

const upload = multer({ storage });

// 🏠 Home Page - Display Product & User Stats

router.get("/", async (req, res) => {
    try {
        // ✅ Fetch counts
        const productCount = await Product.countDocuments();
        const userCount = await User.countDocuments();
        const orderCount = await Order.countDocuments();
        

        const totalSalesData = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: "$totalAmount" } // ✅ Summing totalAmount directly
                }
            }
        ]);
        

        
        const totalSales = totalSalesData.length > 0 ? totalSalesData[0].total : 0;  // ✅ Ensures totalSales isn't undefined
        

        // ✅ Fetch user statistics for chart
        const userStats = await User.aggregate([
            {
                $group: {
                    _id: { $month: "$createdAt" }, // Group users by month
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // ✅ Fetch product category statistics for pie chart (with category names)
        const categoryStats = await Product.aggregate([
            {
                $lookup: {  // Fetch category names from Category collection
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "categoryDetails"
                }
            },
            { $unwind: "$categoryDetails" },  // Extract category name
            {
                $group: {
                    _id: "$categoryDetails.name",  // ✅ Use category name instead of ID
                    count: { $sum: 1 }
                }
            }
        ]);

        const salesStats = await Order.aggregate([
            {
                $group: {
                    _id: { $month: "$createdAt" },  // ✅ Group by month
                    sales: { $sum: "$totalAmount" }  // ✅ Sum total sales for each month
                }
            },
            { $sort: { _id: 1 } }  // ✅ Sort by month (ascending)
        ]);
        
        

        res.render("index", {
            productCount,
            userCount,
            orderCount,
            totalSales,
            userStats: JSON.stringify(userStats),
            categoryStats: JSON.stringify(categoryStats),
            salesStats: JSON.stringify(salesStats),
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});


// 📌 Category Routes
router.get("/insert-category", (req, res) => res.render("insert2"));

router.post("/insert-category", upload.single("category-image"), async (req, res) => {
    try {
        const { "category-name": name } = req.body;
        if (!name) return res.status(400).json({ message: "Category name is required." });

        const image = req.file ? req.file.filename : ""; // ✅ Store only filename

        const category = new Category({ name, image });
        await category.save();

        res.status(201).json({ message: "Category inserted successfully!" });
    } catch (error) {
        console.error("Error inserting category:", error);
        res.status(500).json({ message: "An error occurred while inserting the category." });
    }
});

router.get("/view-category", async (req, res) => {
    try {
        const categories = await Category.find();
        res.render("view2", { categories });
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).send("Error fetching categories");
    }
});

// 📌 Product Routes
router.get("/insert-product", (req, res) => res.render("insert1"));

router.post("/insert-product", upload.array("product-images"), async (req, res) => {
    try {
        const {
            "product-name": name,
            "product-category": categoryName,
            "product-price": price,
            "product-description": description,
            "product-stock":stock,
        } = req.body;

        if (!name || !categoryName || !price || !description||!stock) {
            return res.status(400).json({ message: "All fields are required." });
        }

        let category = await Category.findOne({ name: categoryName });
        if (!category) {
            category = new Category({ name: categoryName });
            await category.save();
        }

        const images = req.files.map(file => file.filename); // ✅ Store only filename

        const product = new Product({ name, price, images, category: category._id, description,stock });

        await product.save();
        res.status(201).json({ message: "Product inserted successfully!" });
    } catch (error) {
        console.error("Error inserting product:", error);
        res.status(500).json({ message: "An error occurred while inserting the product." });
    }
});

// ✅ Serve Static Files
router.use("/images", express.static(uploadDir));

router.get('/view-products', async (req, res) => {
    try {
        const categories = await Category.find();
        let filter = {};
        if (req.query.category) {
            filter.category = req.query.category; // Filter by selected category
        }

        const products = await Product.find(filter).populate('category');
        res.render('view1', { products, categories, selectedCategory: req.query.category || "" });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send("Server Error");
    }
});


router.post("/delete-product/:id", async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.redirect("/view-products");
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).send("Error deleting product");
    }
});

router.get("/edit-product/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate("category");
        res.render("edit-product", { product });
    } catch (error) {
        console.error("Error fetching product for edit:", error);
        res.status(500).send("Error fetching product for edit");
    }
});

// 👥 Customer Routes
router.get("/view-customers", async (req, res) => {
    try {
        const users = await User.find();
        res.render("view3", { users });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send("Error fetching users");
    }
});

router.delete("/delete-customer/:id", async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).send("Customer deleted successfully");
    } catch (error) {
        console.error("Error deleting customer:", error);
        res.status(500).send("Error deleting customer");
    }
});
router.get('/admin/orders', async (req, res) => {
    try {
        // You can fetch orders here if you want to pass them to the view
        const orders = await Order.find().sort({ createdAt: -1 });
        res.render('view4', { orders }); // Pass the orders to the view if needed
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).send("Failed to fetch orders");
    }
});
router.get('/admin/api/orders', async (req, res) => {
    try {
        const orders = await Order.find()
            .populate({ path: "userId", select: "username email" })  // 🔹 More explicit populate
            .populate({ path: "cartItems.productID", select: "name price" })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ success: false, message: "Failed to fetch orders" });
    }
});

// Route to delete an order
router.delete('/admin/orders/:id', async (req, res) => {
    try {
        const orderId = req.params.id;
        await Order.findByIdAndDelete(orderId);
        res.status(200).json({ success: true, message: "Order deleted successfully" });
    } catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).json({ success: false, message: "Failed to delete order" });
    }
});
router.put('/admin/orders/:orderId/status', async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = status;
        await order.save();

        // Create a notification for the user
        const notification = new Notification({
            userId: order.userId,
            message: `Your order ${order.orderID} status has been updated to ${status}`
        });
        await notification.save();

        res.json({ message: 'Order status updated successfully', orderID: order.orderID, userId: order.userId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.get('/admin/custom-orders', async (req, res) => {
    try {
        const customOrders = await CustomOrder.find().sort({ createdAt: -1 });
        res.render('custom-orders', { customOrders }); // Pass custom orders to the view
    } catch (error) {
        console.error("Error fetching custom orders:", error);
        res.status(500).send("Failed to fetch custom orders");
    }
});

// 📌 API route to fetch custom orders as JSON
router.get('/admin/api/custom-orders', async (req, res) => {
    try {
        const customOrders = await CustomOrder.find()
            .populate({ path: "userId", select: "username email" })  
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, customOrders });
    } catch (error) {
        console.error("Error fetching custom orders:", error);
        res.status(500).json({ success: false, message: "Failed to fetch custom orders" });
    }
});

// 📌 Route to delete a custom order
router.delete('/admin/custom-orders/:id', async (req, res) => {
    try {
        const orderId = req.params.id;
        await CustomOrder.findByIdAndDelete(orderId);
        res.status(200).json({ success: true, message: "Custom order deleted successfully" });
    } catch (error) {
        console.error("Error deleting custom order:", error);
        res.status(500).json({ success: false, message: "Failed to delete custom order" });
    }
});

// 📌 Route to update the status of a custom order
router.put('/admin/custom-orders/:orderId/status', async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const customOrder = await CustomOrder.findById(orderId);
        if (!customOrder) {
            return res.status(404).json({ message: 'Custom order not found' });
        }

        customOrder.status = status;
        await customOrder.save();

        // 📌 Create a notification for the user
        const notification = new Notification({
            userId: customOrder.userId,
            message: `Your custom order ${customOrder.orderID} status has been updated to ${status}`
        });
        await notification.save();

        res.json({ message: 'Custom order status updated successfully', orderID: customOrder.orderID, userId: customOrder.userId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});




module.exports = router;
