const mongoose = require('mongoose');

console.log("Attempting connection...");
mongoose.connect('mongodb://127.0.0.1:27017/grocery')
    .then(() => {
        console.log("Connection SUCCESS!");
        process.exit(0);
    })
    .catch(err => {
        console.error("Connection FAILED:", err.message);
        process.exit(1);
    });
