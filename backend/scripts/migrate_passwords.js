const bcrypt = require("bcryptjs");
const initializeDatabase = require("../config/database");
const { loginModel } = require("../model/grocerymodel");

async function migratePasswords() {
    await initializeDatabase();
    const users = await loginModel.find({});
    let convertedCount = 0;

    for (const user of users) {
        if (typeof user.password !== "string" || !/^\$2[aby]\$/.test(user.password) || user.password.length !== 60) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(String(user.password || ""), salt);
            await user.save();
            convertedCount += 1;
        }
    }

    console.log(`Checked ${users.length} users. Converted ${convertedCount} plaintext passwords.`);
}

migratePasswords().catch((error) => {
    console.error("Password migration failed:", error);
    process.exitCode = 1;
});
