const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const connectDB = require("./config/db");

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/images", express.static(path.join(__dirname, "../backend/public/images")));

console.log(path.join(__dirname, "../backend/public/images"));



// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Set views folder and view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs"); // If using EJS, otherwise remove

// Import routes


const adminRoutes = require("./routes/adminRoutes");
app.use("/admin", adminRoutes);
const generalRoutes = require("./routes/generalRoutes");
app.use("/", generalRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Admin Panel Backend running on port ${PORT}`));
