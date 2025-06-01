const express = require("express");
const wishlist_route = express();
const bodyParser = require("body-parser");

wishlist_route.use(bodyParser.json());
wishlist_route.use(bodyParser.urlencoded({ extended: true }));

const auth = require("../middlewares/isAuthenticated");
const wishlist_controller = require("../controllers/wishlistController");

// Add product to wishlist
wishlist_route.post('/add-to-wishlist', auth, wishlist_controller.add_to_wishlist);

// Move item from wishlist to cart
wishlist_route.post('/wishlist/move-to-cart/:itemId', auth, wishlist_controller.move_to_cart);

// Remove item from wishlist
wishlist_route.delete('/wishlist/remove/:itemId', auth, wishlist_controller.remove_from_wishlist);

module.exports = wishlist_route;
