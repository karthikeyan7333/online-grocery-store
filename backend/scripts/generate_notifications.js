const mongoose = require('mongoose');
const { productModel, notificationModel } = require('../model/grocerymodel');

const run = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/grocery");
        console.log("Connected to DB");

        const products = await productModel.find({
            $or: [
                { stockStatus: 'Out of Stock' },
                { stockQuantity: { $lte: 0 } }
            ]
        }).populate('shopid');

        console.log(`Found ${products.length} out of stock products.`);

        let count = 0;
        for (const product of products) {
            // Notify Admin
            await new notificationModel({
                recipientRole: 'admin',
                message: `Product Out of Stock: ${product.productname}`,
                type: 'warning'
            }).save();

            // Notify Shop
            if (product.shopid) {
                await new notificationModel({
                    recipientRole: 'shop',
                    recipientId: product.shopid._id,
                    message: `Alert: ${product.productname} is Out of Stock!`,
                    type: 'warning'
                }).save();
            }
            count++;
        }

        console.log(`Generated ${count} notifications.`);
        process.exit();

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

run();
