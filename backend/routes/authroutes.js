const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Cart = require("../models/Cart"); // Import Cart model

// Helper function for rendering errors
const renderError = (res, view, error) => {
    res.render(view, { error });
};

// ----------------- Signup Routes -----------------
router.get("/signup", (req, res) => res.render("signup", { error: null }));

router.post("/signup", async (req, res) => {
    const { username, email, password, confirmpassword, securityQuestions } = req.body;

    if (!username || !email || !password || !confirmpassword) {
        return renderError(res, "signup", "All fields are required.");
    }

    if (password !== confirmpassword) {
        return renderError(res, "signup", "Passwords do not match.");
    }

    try {
        // Check if email already exists
        const existingUser  = await User.findOne({ email });
        if (existingUser ) {
            return renderError(res, "signup", "Email is already registered.");
        }

        // Create new user
        const newUser  = new User({
            username,
            email,
            password, // Directly storing the plain password (consider hashing in production)
            securityQuestions,
        });

        await newUser .save();

        // Create cart for the new user after successful signup
        const newCart = new Cart({
            userId: newUser ._id, // Associate cart with the user
        });

        await newCart.save();
        console.log(`Cart created for user ${newUser .email} with cartId: ${newCart._id}`);

        return res.status(201).json({ message: "Signup successful", cartId: newCart._id }); // Redirect to login after successful signup
    } catch (err) {
        console.error("Error during signup:", err);
        return renderError(res, "signup", "An error occurred during signup. Please try again.");
    }
});

// ----------------- Login Routes -----------------
router.get("/login", (req, res) => res.render("login", { error: null }));

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
        return res.status(400).json({ error: "Both email and password are required." });
    }
  
    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user || user.password !== password) { // Direct comparison for now
            return res.status(401).json({ error: "Invalid email or password." });
        }
  
        // Save user info in session
        req.session.user = { id: user._id, username: user.username };
  
        // Check if the user already has a cart
        let cart = await Cart.findOne({ userId: user._id });
  
        if (!cart) {
            // If the user doesn't have a cart, create one
            cart = new Cart({ userId: user._id });
            await cart.save();
            console.log(`Cart created for user ${user.email} with cartId: ${cart._id}`);
        }
  
        // Store cartId in session
        req.session.cartId = cart._id; // ✅ Fixed: Using `cart._id`, not `Cart._id`
        req.session.userId=user._id;      // Respond with a success message and cartId
        res.json({ redirect: "/", cartId: cart._id,userId:user._id }); // ✅ Fixed: Using `cart._id`
    } catch (err) {
        console.error("Error during login:", err);
        return res.status(500).json({ error: "An error occurred during login. Please try again." });
    }
  });
  
// ----------------- Forgot Password Routes -----------------
router.get("/forgot-password", (req, res) => res.render("forgot-password", { error: null }));

router.post("/forgot-password", async (req, res) => {
    const { email, question, answer } = req.body;

    if (!email || !question || !answer) {
        return renderError(res, "forgot-password", "All fields are required.");
    }

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return renderError(res, "forgot-password", "User  not found.");
        }

        // Verify security question and answer
        const securityQuestion = user.securityQuestions.find((q) => q.question === question);
        if (!securityQuestion || securityQuestion.answer !== answer) {
            return renderError(res, "forgot-password", "Incorrect security question or answer.");
        }

        res.redirect(`/reset-password?email=${encodeURIComponent(email)}`); // Redirect to reset password page
    } catch (err) {
        console.error("Error during forgot password:", err);
        return renderError(res, "forgot-password", "An error occurred. Please try again.");
    }
});

// ----------------- Reset Password Routes -----------------
router.post("/reset-password", async (req, res) => {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
        return res.status(400).send("Email and new password are required.");
    }

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send("User  not found.");
        }

        // Update user password
        user.password = newPassword; // Store the new password directly (consider hashing in production)
        await user.save();

        res.redirect("/login"); // Redirect to login after password reset
    } catch (err) {
        console.error("Error during password reset:", err);
        return res.status(500).send("An error occurred. Please try again.");
    }
});

// ----------------- Logout Route -----------------
router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error during logout:", err);
            return res.status(500).send("An error occurred during logout.");
        }
        res.redirect("/"); // Redirect to home after logout
    });
});

module.exports = router;