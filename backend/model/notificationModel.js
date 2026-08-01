const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    recipientRole: {
        type: String, // 'admin' or 'shop'
        required: true
    },
    recipientId: {
        type: mongoose.Schema.Types.ObjectId, // For shop (shopid), null for admin
        ref: 'shop',
        default: null
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String, // 'alert', 'info', 'success', 'warning'
        default: 'info'
    },
    read: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const notificationModel = mongoose.model("notification", notificationSchema);

module.exports = notificationModel;
