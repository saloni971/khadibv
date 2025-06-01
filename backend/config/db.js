const mongoose = require('mongoose');

const connection = mongoose.connect('mongodb://0.0.0.0/backend')
    .then(() => {
        console.log("Connected to the database");
    })
    .catch((err) => {
        console.error("Database connection error", err);
    });

module.exports = connection;
