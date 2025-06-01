const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middlewares/isAuthenticated");

// Profile Route
router.get("/", isAuthenticated, (req, res) => {
  res.render("profile", { user: req.session.user, error: null, message: null });
});

module.exports = router;
