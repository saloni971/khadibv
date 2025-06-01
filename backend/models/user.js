const mongoose = require('mongoose');

// Define the schema for the user model
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true, 
        match: [/^\S+@\S+\.\S+$/, 'Invalid email format'] 
    },
    password: { type: String, required: true, minlength: 6 },
    securityQuestions: [
        {
            question: { type: String, required: true },
            answer: { type: String, required: true }
        }
    ]
}, { timestamps: true });  // ✅ Added timestamps

// Create the user model
const userModel = mongoose.model('User', userSchema);

module.exports = userModel;







