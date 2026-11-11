const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const fs = require("fs");
const path = require("path");
var cors = require("cors");
var bodyParser = require("body-parser");
const fileUpload = require('express-fileupload');
const app = express();
const assetDirectory = path.join(__dirname, "asset");
for (const directory of ["category", "product", "subcategory", "offer"]) {
    fs.mkdirSync(path.join(assetDirectory, directory), { recursive: true });
}
const database = require("./config/database");
var formRouter = require("./routes/groceryrouter");
const paymentRouter = require("./routes/paymentRoutes")

app.use(fileUpload());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(assetDirectory));

const { createAdmin } = require("./controller/grocerycontroller");

app.use("/grocery", formRouter);
app.use("/api/payment", paymentRouter);

async function startServer() {
    await database();
    await createAdmin();
    return app.listen(5510, () => {
        console.log("Server running on port 5510");
    });
}

if (require.main === module) {
    startServer().catch((error) => {
        console.error("Server startup failed:", error.message);
        process.exitCode = 1;
    });
}

module.exports = { app, startServer };
