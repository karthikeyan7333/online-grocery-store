const initializeDatabase = require("../config/database");
const { productModel, notificationModel } = require("../model/grocerymodel");

async function generateNotifications() {
    await initializeDatabase();
    const products = await productModel.find({
        $or: [
            { stockStatus: "Out of Stock" },
            { stockQuantity: { $lte: 0 } }
        ]
    }).populate("shopid");

    console.log(`Found ${products.length} out of stock products.`);
    for (const product of products) {
        await new notificationModel({
            recipientRole: "admin",
            message: `Product Out of Stock: ${product.productname}`,
            type: "warning"
        }).save();

        if (product.shopid) {
            await new notificationModel({
                recipientRole: "shop",
                recipientId: product.shopid._id,
                message: `Alert: ${product.productname} is Out of Stock!`,
                type: "warning"
            }).save();
        }
    }
    console.log(`Generated ${products.length} product notifications.`);
}

generateNotifications().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
