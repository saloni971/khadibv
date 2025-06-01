const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
require("./config/db");

// Initialize app
const app = express();
app.use(express.static('public'));


app.use(session({
    secret: "abab",  // Change this to a secure key
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 1 Day
        httpOnly: true,  
        secure: false,  // Set to true if using HTTPS
        sameSite: "lax"
    }
}));
  // Session middleware
  app.use("/images", express.static(path.join(__dirname, "public/images")));


// Set up a middleware to store session user data globally
app.use((req, res, next) => {
  // Make user data available to all views, even if it's not in every route
  res.locals.user = req.session.user || null;
  next();  // Pass control to the next middleware/route handler
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use("/public", express.static(path.join(__dirname, "public")));

// Set the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use("/", require("./routes/authroutes"));  // Authentication routes
app.use("/", require("./routes/generalroutes"));  // General public routes
app.use("/", require("./routes/profileroutes"));  
// Profile-related routes (needs authentication)
app.use("/",require("./routes/cartRoutes"));
const wishlistRoute = require("./routes/wishlistroutes");
app.use('/', wishlistRoute);
// Import and use the customization routes
const customizationRoutes = require('./routes/customization');
app.use('/customization', customizationRoutes);



// Start the server
const PORT = process.env.PORT || 5500;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

