const CartItem = require("../models/CartItem");
const Product = require("../models/Product"); // Import Product model

const add_to_cart = async (req, res) => {
    try {
        const { productId, cartId } = req.body;

        console.log("Received cartId:", cartId);

        if (!productId || !cartId) {
            return res.status(400).json({ success: false, msg: "Missing productId or cartId." });
        }

        // Fetch product details
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, msg: "Product not found." });
        }

        // Ensure product images exist
        const productImage = product.images && product.images.length > 0 ? product.images[0] : "placeholder.jpg";

        // Check if the item already exists in the cart
        const existingCartItem = await CartItem.findOne({ productID: product._id, cartId });

        if (existingCartItem) {
            existingCartItem.quantity += 1;
            await existingCartItem.save();
            return res.status(200).json({ success: true, msg: "Product quantity updated successfully!", data: existingCartItem });
        }

        // Create a new cart item
        const cartItem = new CartItem({
            productID: product._id,
            name: product.name,
            price: product.price,
            image: productImage, // Using safe image selection
            cartId,
            quantity: 1
        });

        const cartData = await cartItem.save();
        res.status(200).json({ success: true, msg: "Product added to cart successfully!", data: cartData });

    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ success: false, msg: "Internal server error", error: error.message });
    }
};

const remove_from_cart = async (req, res) => {
    try {
        const { itemId } = req.params;

        // Find the cart item
        const cartItem = await CartItem.findById(itemId);

        if (!cartItem) {
            return res.status(404).json({ success: false, msg: "Item not found in cart." });
        }

        // If quantity is greater than 1, decrease it and return updated item
        if (cartItem.quantity > 1) {
            cartItem.quantity -= 1;
            await cartItem.save();
            return res.status(200).json({ 
                success: true, 
                msg: "Quantity decreased by 1.", 
                cartItem,  // Send updated item
                remove: false  // Indicate that the item is not removed yet
            });
        }

        // If quantity is 1, remove the item from cart
        await CartItem.findByIdAndDelete(itemId);
        return res.status(200).json({ 
            success: true, 
            msg: "Item removed from cart successfully.", 
            remove: true,  // Indicate that the item is removed
            itemId 
        });

    } catch (error) {
        console.error("Error removing item from cart:", error.message);
        res.status(500).json({ success: false, msg: "Internal server error", error: error.message });
    }
};

module.exports = {
    add_to_cart
    ,remove_from_cart
};
