const mongoose = require("mongoose");
const WishlistItem = require("../models/WishlistItem");
const Product = require("../models/Product");
const Wishlist=require("../models/Wishlist"); 
const Cart=require("../models/Cart");
const CartItem=require("../models/CartItem");
// Import Product model
const add_to_wishlist = async (req, res) => {
    try {
        const { productId, userId } = req.body;

        // Debugging: Log the received userId and productId
        console.log("Received userId:", userId);
        console.log("Received productId:", productId);

        // Validate input
        if (!productId || !userId) {
            return res.status(400).json({ success: false, msg: "Missing productId or userId." });
        }

        // Validate productId format
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, msg: "Invalid productId." });
        }

        // Fetch product details from Product model
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, msg: "Product not found." });
        }

        // Find or create a wishlist for the user
        let wishlist = await Wishlist.findOne({ userId });
        if (!wishlist) {
            // Create a new wishlist if it doesn't exist
            wishlist = new Wishlist({ userId });
            await wishlist.save();
        }

        // Check if the item already exists in the wishlist
        const existingWishlistItem = await WishlistItem.findOne({ productId: product._id, wishlistId: wishlist._id });
        if (existingWishlistItem) {
            return res.status(200).json({ success: true, msg: "Product is already in wishlist!", data: existingWishlistItem });
        }

        // Create a new wishlist item with product details
        const wishlistItem = new WishlistItem({
            wishlistId: wishlist._id, // Associate with the user's wishlist
            productId: product._id,
        });

        // Save wishlist item to database
        const wishlistData = await wishlistItem.save();

        res.status(200).json({ success: true, msg: "Product added to wishlist successfully!", data: wishlistData });

    } catch (error) {
        console.error("Error adding to wishlist:", error.message);
        console.error("Error Stack:", error.stack); // Log the full stack trace
        res.status(500).json({ success: false, msg: "Internal server error", error: error.message });
    }
};
const move_to_cart = async (req, res) => {
    try {
        const { itemId } = req.params;
        const userId = req.session.user.id; // Assuming authentication

        // Validate itemId
        if (!mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({ success: false, msg: "Invalid itemId." });
        }

        // Find the wishlist item and populate the product details
        const wishlistItem = await WishlistItem.findById(itemId).populate("productId");
        if (!wishlistItem) {
            return res.status(404).json({ success: false, msg: "Wishlist item not found." });
        }

        const product = wishlistItem.productId;
        if (!product) {
            return res.status(404).json({ success: false, msg: "Product not found in wishlist item." });
        }

        // ✅ Debugging: Log product image
        console.log("Product Image:", product.image);

        // ✅ Extract image properly
        let productImage = Array.isArray(product.image) ? product.image[0] : product.image;
        if (!productImage) {
            productImage = "default-image.jpg"; // Set a default image if missing
        }

        // ✅ Find or create user's cart
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = await Cart.create({ userId });
        }

        // ✅ Check if the item already exists in the cart
        const existingCartItem = await CartItem.findOne({ cartId: cart._id, productID: product._id });

        if (existingCartItem) {
            // Increase quantity if already in cart
            existingCartItem.quantity += 1;
            await existingCartItem.save();
        } else {
            // Add new item to CartItem
            await CartItem.create({
                productID: product._id,
                name: product.name,
                price: product.price,
                image: productImage, // ✅ Ensures image is a valid string
                cartId: cart._id,
                quantity: 1,
            });
        }

        // ✅ Remove item from wishlist
        await WishlistItem.findByIdAndDelete(itemId);

        res.status(200).json({ success: true, msg: "Item moved to cart successfully." });
    } catch (error) {
        console.error("Error moving item to cart:", error.message);
        res.status(500).json({ success: false, msg: "Internal server error", error: error.message });
    }
};


// Remove item from wishlist
const remove_from_wishlist = async (req, res) => {
    try {
        const { itemId } = req.params;

        // Remove the item from the wishlist
        await WishlistItem.findByIdAndDelete(itemId);

        res.status(200).json({ success: true, msg: "Item removed from wishlist successfully." });
    } catch (error) {
        console.error("Error removing item from wishlist:", error.message);
        res.status(500).json({ success: false, msg: "Internal server error", error: error.message });
    }
};

module.exports = {
    add_to_wishlist,
    move_to_cart,
    remove_from_wishlist,
};

