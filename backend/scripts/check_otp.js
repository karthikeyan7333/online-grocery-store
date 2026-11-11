const initializeDatabase = require("../config/database");
const { orderModel } = require("../model/grocerymodel");

async function checkOTP() {
    await initializeDatabase();
    const orders = await orderModel.find({ status: "Dispatched" })
        .populate({ path: "userid", populate: { path: "regid" } })
        .sort({ updatedAt: -1 });

    console.log(`Found ${orders.length} Dispatched orders.`);
    for (const order of orders) {
        const customerName = order.userid?.regid?.name || "Unknown";
        const email = order.userid?.email || "Unknown";
        console.log(`Order ID: ${order._id}`);
        console.log(`Customer: ${customerName} (${email})`);
        console.log(`OTP: ${order.deliveryOTP}`);
        console.log("-----------------------------------");
    }
}

checkOTP().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
