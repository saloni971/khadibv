const express = require('express');
const router = express.Router();
const Customization = require("../models/Customization");
const isAuthenticated = require("../middlewares/isAuthenticated"); // Import the middleware

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// Render the main customization page
router.get('/', (req, res) => {
    res.render('custom');
});

// Define routes for each customization step
router.get('/neck', (req, res) => res.render('neck'));
router.get('/sleeveLength', (req, res) => res.render('sleeveLength'));
router.get('/selectLen', (req, res) => res.render('selectLen'));
router.get('/color', (req, res) => res.render('color'));
router.get('/review', (req, res) => res.render('review'));
router.get('/complete', (req, res) => res.render('complete'));
router.get('/adjust', (req, res) => res.render('adjust'));
router.get('/upload', (req, res) => res.render('upload'));
router.get('/fabric', (req, res) => res.render('fabric'));
router.get('/size', (req, res) => res.render('size'));
router.get('/imageGallery', (req, res) => res.render('imageGallery'));
router.get('/reviewupload', (req, res) => res.render('reviewupload'));

// Handle customization form submission
router.post("/submitCustomization", async (req, res) => {
    try {
        const { userId, neckDesign, sleeveLength, kurtiLength, fabricType, color, colorName } = req.body;
        await Customization.create({ userId, neckDesign, sleeveLength, kurtiLength, fabricType, color, colorName });
        res.json({ message: "Customization saved successfully!" });
    } catch (error) {
        console.error("Error saving customization:", error);
        res.status(500).json({ message: "Server error" });
    }
});
router.get("/getSession", (req, res) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ error: "User not logged in" });
    }
    res.json({ userId: req.session.user.id });
});


module.exports = router;
