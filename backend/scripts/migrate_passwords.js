const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { loginModel } = require('../model/grocerymodel');
require('dotenv').config(); // Defaults to .env in current working directory

const migratePasswords = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/grocery');
        console.log("Connected to MongoDB for migration...");

        const users = await loginModel.find({});
        console.log(`Found ${users.length} users to check.`);

        let convertedCount = 0;

        for (const user of users) {
            // Simple check: simple bcrypt hashes start with $2a$ or $2b$ and are 60 chars long.
            // If password doesn't look like a hash, we hash it.
            if (!user.password.startsWith('$2') || user.password.length !== 60) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(user.password, salt);

                user.password = hashedPassword;
                await user.save();
                convertedCount++;
                console.log(`Converted password for: ${user.email}`);
            }
        }

        console.log(`Migration complete. Converted ${convertedCount} passwords.`);
        process.exit(0);

    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

migratePasswords();
