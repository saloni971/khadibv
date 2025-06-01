const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Category = require("../models/category");
const Product = require("../models/Product"); // Adjust the path as necessary
const Cart=require("../models/Cart");
const User = require('../models/user'); // Check the correct path
const CartItem = require("../models/CartItem");
const Wishlist = require('../models/Wishlist'); 
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Notification = require('../models/Notification');
const WishlistItem = require('../models/WishlistItem'); 
const isAuthenticated=require("../middlewares/isAuthenticated");
const { v4: uuidv4 } = require("uuid");


 // Adjust the path based on your project structure



// Home Route (No session check needed here, as it's a public page)
router.get("/", (req, res) => {
  res.render("index", { user: req.session.user || null });
});
router.post("/place-order", isAuthenticated, async (req, res) => {
  try {
      const { name, address, pincode, city, state, cartItems, paymentMethod } = req.body;
      const userId = req.session.user?.id;

      if (!name || !address || !pincode || !city || !state || !cartItems || cartItems.length === 0) {
          return res.status(400).json({ success: false, message: "Missing required fields" });
      }

      if (!userId) {
          return res.status(401).json({ success: false, message: "User not authenticated" });
      }

      console.log("Extracted User ID:", userId);
      const objectUserId = new mongoose.Types.ObjectId(userId);
      const orderID = uuidv4();

      let totalAmount = 0; // ✅ Initialize total amount

      // Check stock availability and compute total amount
      for (const item of cartItems) {
          const product = await Product.findById(item.productID);
          if (!product) {
              return res.status(404).json({ success: false, message: `Product not found: ${item.productID}` });
          }
          if (product.stock < item.quantity) {
              return res.status(400).json({ success: false, message: `Not enough stock for product: ${product.name}` });
          }

          totalAmount += product.price * item.quantity; // ✅ Compute totalAmount correctly
      }

      // Create new order
      const newOrder = new Order({
          userId: objectUserId,
          orderID,
          name,
          address,
          pincode,
          city,
          state,
          cartItems,
          totalAmount,  // ✅ Now totalAmount is calculated dynamically
          paymentMethod,
          status: "Pending",
      });

      // Save the order
      await newOrder.save();
      console.log("Order saved successfully:", newOrder);

      // Update product stock
      for (const item of cartItems) {
          await Product.findByIdAndUpdate(item.productID, {
              $inc: { stock: -item.quantity } // Decrease stock by the quantity ordered
          });
      }

      res.status(201).json({ success: true, message: "Order placed successfully!", orderID });

  } catch (error) {
      console.error("Error placing order:", error);
      res.status(500).json({ success: false, message: "Failed to place order" });
  }
});

// Route to render Order Confirmation Page
router.get("/order-confirmation", (req, res) => {
  res.render("order-confirmation", req.query);
});
router.get("/checkout",isAuthenticated, async (req, res) => {
  console.log("Session User Data:", req.session.user);

  if (!req.session.user) {
      return res.status(401).json({ error: "Unauthorized: Please log in first" });
  }

  try {
      // Find the user's cart
      const cart = await Cart.findOne({ userId: req.session.user.id });

      if (!cart) {
          return res.render("checkout", { user: req.session.user, cartItems: [], totalPrice: 0 });
      }

      // Fetch cart items with full product details
      const cartItems = await CartItem.find({ cartId: cart._id })
          .populate("productID") // Ensure product details are fetched
          .exec();

      // If the product is missing, handle it properly
      cartItems.forEach(item => {
          if (!item.productID) {
              item.name = "Product not found";
              item.price = "Not available";
          }
      });

      // Calculate total price (excluding missing products)
      let totalPrice = cartItems.reduce((sum, item) => {
          return sum + (item.productID ? item.price * item.quantity : 0);
      }, 0);

      res.render("checkout", { user: req.session.user, cartItems, totalPrice });
  } catch (err) {
      console.error("Error fetching cart:", err);
      res.status(500).json({ error: "An error occurred while fetching the cart." });
  }
});

// Uniform Route (Ensure user is logged in)
router.get("/uniforms", async (req, res) => {
  // Check if the user is logged in
  if (!req.session.user) {
    return res.redirect("/login"); // Redirect to login if not logged in
  }

  try {
    // Find the "Uniforms" category
    const category = await Category.findOne({ name: "uniforms" });

    if (!category) {
      console.error("Category 'Uniforms' not found.");
      return res.status(404).send("Category 'Uniforms' not found.");
    }

    const products = await Product.find({ category: category._id });

    if (!products || products.length === 0) {
      console.log("No products found for the 'Uniforms' category.");
    } else {
      console.log(`Fetched ${products.length} products for 'Uniforms' category.`);
    }

    res.render("uniforms", { products });
  } catch (err) {
    console.error("Error fetching uniforms:", err);
    res.status(500).send("An error occurred while fetching uniforms.");
  }
});
router.get("/pants", async (req, res) => {
  // Check if the user is logged in
  if (!req.session.user) {
    return res.redirect("/login"); // Redirect to login if not logged in
  }

  try {
    // Find the "Pants" category
    const category = await Category.findOne({ name: "pants" });

    if (!category) {
      console.error("Category 'Pants' not found.");
      return res.status(404).send("Category 'Pants' not found.");
    }

    // Find all products under the Pants category
    const products = await Product.find({ category: category._id });

    if (!products || products.length === 0) {
      console.log("No products found for the 'Pants' category.");
    } else {
      console.log(`Fetched ${products.length} products for 'Pants' category.`);
    }

    res.render("pants", { products });
  } catch (err) {
    console.error("Error fetching pants:", err);
    res.status(500).send("An error occurred while fetching pants.");
  }
});

router.get("/saree", async (req, res) => {
  // Check if the user is logged in
  if (!req.session.user) {
    return res.redirect("/login"); // Redirect to login if not logged in
  }

  try {
    // Find the "Sarees" category
    const category = await Category.findOne({ name: "saree" });

    if (!category) {
      console.error("Category 'Sarees' not found.");
      return res.status(404).send("Category 'Sarees' not found.");
    }

    // Find all products under the Sarees category
    const products = await Product.find({ category: category._id });

    if (!products || products.length === 0) {
      console.log("No products found for the 'Sarees' category.");
    } else {
      console.log(`Fetched ${products.length} products for 'Sarees' category.`);
    }

    res.render("sarees", { products });
  } catch (err) {
    console.error("Error fetching sarees:", err);
    res.status(500).send("An error occurred while fetching sarees.");
  }
});
router.get("/bags", async (req, res) => {
  // Check if the user is logged in
  if (!req.session.user) {
    return res.redirect("/login"); // Redirect to login if not logged in
  }

  try {
    // Find the "Bags" category
    const category = await Category.findOne({ name: "bags" });

    if (!category) {
      console.error("Category 'Bags' not found.");
      return res.status(404).send("Category 'Bags' not found.");
    }

    // Find all products under the Bags category
    const products = await Product.find({ category: category._id });

    if (!products || products.length === 0) {
      console.log("No products found for the 'Bags' category.");
    } else {
      console.log(`Fetched ${products.length} products for 'Bags' category.`);
    }

    res.render("bags", { products });
  } catch (err) {
    console.error("Error fetching bags:", err);
    res.status(500).send("An error occurred while fetching bags.");
  }
});
router.get("/kurti", async (req, res) => {
  // Check if the user is logged in
  if (!req.session.user) {
    return res.redirect("/login"); // Redirect to login if not logged in
  }

  try {
    // Find the "Kurti" category
    const category = await Category.findOne({ name: "kurti" });

    if (!category) {
      console.error("Category 'Kurti' not found.");
      return res.status(404).send("Category 'Kurti' not found.");
    }

    // Find all products under the Kurti category
    const products = await Product.find({ category: category._id });

    if (!products || products.length === 0) {
      console.log("No products found for the 'Kurti' category.");
    } else {
      console.log(`Fetched ${products.length} products for 'Kurti' category.`);
    }

    res.render("kurti", { products });
  } catch (err) {
    console.error("Error fetching kurtis:", err);
    res.status(500).send("An error occurred while fetching kurtis.");
  }
});
router.get("/bedsheets", async (req, res) => {
  // Check if the user is logged in
  if (!req.session.user) {
    return res.redirect("/login"); // Redirect to login if not logged in
  }

  try {
    // Find the "Bedsheets" category
    const category = await Category.findOne({ name: "bedsheets" });

    if (!category) {
      console.error("Category 'Bedsheets' not found.");
      return res.status(404).send("Category 'Bedsheets' not found.");
    }

    // Find all products under the Bedsheets category
    const products = await Product.find({ category: category._id });

    if (!products || products.length === 0) {
      console.log("No products found for the 'Bedsheets' category.");
    } else {
      console.log(`Fetched ${products.length} products for 'Bedsheets' category.`);
    }

    res.render("bedsheets", { products });
  } catch (err) {
    console.error("Error fetching bedsheets:", err);
    res.status(500).send("An error occurred while fetching bedsheets.");
  }
});




// Cart Route (Ensure user is logged in)
router.get("/cart", isAuthenticated, async (req, res) => {
  try {
    console.log("Session Data:", req.session); // Debug session

    if (!req.session.user) {
      console.log("User  not logged in.");
      return res.render("cart", { cart: [] });
    }

    const userId = req.session.user.id; // Access the user ID from the session
    console.log("User  ID:", userId);

    // Find the user's cart
    const cart = await Cart.findOne({ userId });
    console.log("Cart Found:", cart);

    if (!cart) {
      console.log("Cart is empty.");
      return res.render("cart", { cart: [] });
    }

    // Get all cart items and populate product data
    const cartItems = await CartItem.find({ cartId: cart._id })
      .populate('productID') // Populate the productID field
      .lean(); // Convert to plain JavaScript objects
    console.log("Cart Items:", cartItems);

    res.render("cart", { cart: cartItems });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).send("Server Error");
  }
});



// Wishlist Route (Ensure user is logged in)
router.get("/wishlist", isAuthenticated, async (req, res) => {
  try {
    console.log("Session Data:", req.session); // Debug session

    if (!req.session.user) {
      console.log("User not logged in.");
      return res.render("wishlist", { wishlist: [] });
    }

    const userId = req.session.user.id; // Access the user ID from the session
    console.log("User ID:", userId);

    // Find the user's wishlist
    const wishlist = await Wishlist.findOne({ userId });
    console.log("Wishlist Found:", wishlist);

    if (!wishlist) {
      console.log("Wishlist is empty.");
      return res.render("wishlist", { wishlist: [] });
    }

    // Get all wishlist items and populate product data
    const wishlistItems = await WishlistItem.find({ wishlistId: wishlist._id })
      .populate('productId') // Populate the productID field
      .lean(); // Convert to plain JavaScript objects
    console.log("Wishlist Items:", wishlistItems);

    res.render("wishlist", { wishlist: wishlistItems });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).send("Server Error");
  }
});
router.get('/product-details', async (req, res) => {
  try {
      const productId = req.query.id; // Get the product ID from the query parameter
      const product = await Product.findById(productId); // Fetch the product from the database

      if (!product) {
          return res.status(404).send('Product not found');
      }

      // Render the product-details.ejs template and pass the product data
      res.render('product-details', { product });
  } catch (error) {
      console.error('Error fetching product details:', error);
      res.status(500).send('Internal Server Error');
  }
});
router.get("/api/cart", async (req, res) => {
  try {
      const userId = req.session.userId; // Get logged-in user ID
      const cartItems = await CartItem.find({ user: userId }).populate("product");
      res.json(cartItems);
  } catch (error) {
      res.status(500).json({ error: "Failed to fetch cart items" });
  }
});


// Get User Route (Check if user is logged in)
router.get("/getUser", (req, res) => {
  console.log("Checking session:", req.session); // Debugging session state

  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.status(401).json({ loggedIn: false, message: "User not logged in" });
  }
});
router.get("/search", async (req, res) => {
  const query = req.query.query;

  if (!query) {
    return res.json([]);
  }

  try {
    const results = await Product.find({
      name: { $regex: query, $options: "i" }, // Case-insensitive search
    }).limit(10);

    res.json(results);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router.post("/save-address",isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.user?.id;
      const { name, address, pincode, city, state } = req.body;

      if (!name || !address || !pincode || !city || !state) {
          return res.status(400).json({ error: "All fields are required" });
      }

      await User.findByIdAndUpdate(userId, {
          address: { name, address, pincode, city, state },
      });

      res.json({ success: true, message: "Address updated successfully" });
  } catch (error) {
      console.error("Error saving address:", error);
      res.status(500).json({ error: "Failed to save address" });
  }
});


router.get("/get-saved-address", isAuthenticated, async (req, res) => {
  try {
      const userId = req.session.user?.id;
      if (!userId) {
          return res.json({ savedAddress: null });
      }

      console.log("Extracted User ID:", userId);

      // Convert userId to ObjectId if needed
      const objectUserId = new mongoose.Types.ObjectId(userId);

      // Find the latest order from the user
      const latestOrder = await Order.findOne({ userId: objectUserId }).sort({ createdAt: -1 });

      if (latestOrder) {
          console.log("Found saved address:", latestOrder.address);
          return res.json({
              savedAddress: {
                  name: latestOrder.name,
                  address: latestOrder.address,
                  pincode: latestOrder.pincode,
                  city: latestOrder.city,
                  state: latestOrder.state
              }
          });
      } else {
          console.log("First-time user, no address found.");
          return res.json({ savedAddress: null });
      }
  } catch (error) {
      console.error("Error fetching address:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});
router.get("/settings", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login"); // Redirect if not logged in
  }
  
  res.render("settings", { user: req.session.user });
});
router.get("/about", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login"); // Redirect if not logged in
  }
  
  res.render("about", { user: req.session.user });
});
// Get all orders for the logged-in user

// Route to render the EJS page
router.get("/myorders", isAuthenticated, (req, res) => {
  res.render("myorders"); // Render the EJS template
});

// Route to fetch orders as JSON
router.get("/api/myorders", isAuthenticated, async (req, res) => {
  try {
      console.log("Fetching orders for user:", req.session.user?.id); // Debugging log
      const userId = req.session.user?.id;
      if (!userId) {
          console.log("User  ID not found.");
          return res.status(400).json({ message: "User  ID not found" });
      }

      const orders = await Order.find({ userId }).populate("cartItems.productID");
      console.log("Orders fetched:", orders); // Check if data is fetched

      res.json({ orders }); 
  } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
});


// Your authentication middleware

// Get notifications for a user
router.get('/api/notifications', isAuthenticated, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.session.user.id }).sort({ timestamp: -1 });
        res.json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Mark notification as read
router.put('/api/notifications/:id/read', isAuthenticated, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        notification.read = true;
        await notification.save();
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



module.exports = router;
