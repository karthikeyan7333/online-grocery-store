const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
var cors = require("cors");
var bodyParser = require("body-parser");
const fileUpload = require('express-fileupload');
const app = express();
const database = require("./config/database");
var formRouter = require("./routes/groceryrouter");
const paymentRouter = require("./routes/paymentRoutes")

app.use(fileUpload());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('asset'));

const { createAdmin } = require("./controller/grocerycontroller");

database();
createAdmin();

app.use("/grocery", formRouter);
app.use("/api/payment", paymentRouter);

app.listen(5510, () => {
    console.log("Server running on port 5510");
});
