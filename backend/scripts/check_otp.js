const mongoose = require('mongoose');
const { orderModel, loginModel, customerModel, shopModel, productModel, cartModel, offerModel, paymentModel, deliveryModel, farmerModel, notificationModel, categoryModel, subcategoryModel } = require('../model/grocerymodel');

const checkOTP = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/grocery');
        console.log("Connected to DB...");

        const orders = await orderModel.find({ status: 'Dispatched' }).populate({
            path: 'userid',
            populate: { path: 'regid' }
        }).sort({ updatedAt: -1 });

        console.log(`Found ${orders.length} Dispatched orders.`);

        orders.forEach(order => {
            const customerName = order.userid?.regid?.name || 'Unknown';
            const email = order.userid?.email || 'Unknown';
            console.log(`Order ID: ${order._id}`);
            console.log(`Customer: ${customerName} (${email})`);
            console.log(`OTP: ${order.deliveryOTP}`);
            console.log('-----------------------------------');
        });

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkOTP();
