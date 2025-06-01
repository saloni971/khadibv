const mongoose = require("mongoose"); // ✅ Import mongoose

const WishlistItemSchema = new mongoose.Schema({
    wishlistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wishlist', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
}, { timestamps: true });

const WishlistItem = mongoose.model('WishlistItem', WishlistItemSchema);
module.exports = WishlistItem;
