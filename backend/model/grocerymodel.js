const mongoose = require("mongoose");

// Customer Schema
const customerregSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true
    },
    address: {
        type: String,
        required: [true, "Address is required"]
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"]
    },
    dob: {
        type: Date,
        required: [true, "Date of birth is required"]
    },
    age: {
        type: Number,
        required: true
    },
    role: {
        type: String,
        default: 'customer'
    }
}, { timestamps: true });

const customerModel = mongoose.model("customer", customerregSchema);

// Delivery Boy Schema
const deliveryregSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true
    },
    address: {
        type: String,
        required: [true, "Address is required"]
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"]
    },
    vehicleType: {
        type: String,
        required: [true, "Vehicle type is required"]
    },
    vehicleNumber: {
        type: String,
        required: [true, "Vehicle number is required"]
    },
    role: {
        type: String,
        default: 'delivery'
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    }
}, { timestamps: true });

const deliveryModel = mongoose.model("delivery", deliveryregSchema);

// Shop Schema
const shopregSchema = new mongoose.Schema({
    shopName: {
        type: String,
        required: [true, "Shop name is required"],
        trim: true
    },
    ownerName: {
        type: String,
        required: [true, "Owner name is required"],
        trim: true
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"]
    },
    role: {
        type: String,
        default: 'shop'
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    }
}, { timestamps: true });

const shopModel = mongoose.model("shop", shopregSchema);

// Farmer Schema
const farmerregSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true
    },
    address: {
        type: String,
        required: [true, "Address is required"]
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"]
    },
    farmName: {
        type: String,
        required: [true, "Farm name is required"]
    },
    role: {
        type: String,
        default: 'farmer'
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    }
}, { timestamps: true });

const farmerModel = mongoose.model("farmer", farmerregSchema);

// Login Schema
const loginSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    regid: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "regType"
    },
    role: {
        type: String,
        enum: ['customer', 'shop', 'admin', 'delivery', 'farmer'],
        required: true
    },
    regType: {
        type: String,
        required: true,
        enum: ["customer", "shop", "admin", "delivery", "farmer"]
    }
}, { timestamps: true });

const loginModel = mongoose.model("login", loginSchema);

const addcategorySchema = new mongoose.Schema({
    categoryname: {
        type: String,
        required: true
    },
    categoryimage: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    shopid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'shop'
    },
    productid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product'
    }
}, { timestamps: true })
const categoryModel = mongoose.model("category", addcategorySchema)

const addsubcategorySchema = new mongoose.Schema({
    subcategoryname: {
        type: String,
        required: true
    },
    categoryid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
        required: true
    },
    shopid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'shop'
    },
    subcategoryimage: {
        type: String
    }
}, { timestamps: true })
const subcategoryModel = mongoose.model("subcategory", addsubcategorySchema)

const addproductSchema = new mongoose.Schema({
    productname: {
        type: String,
        required: true
    },
    productimage: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    shopid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'shop'
    },
    farmerid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'farmer'
    },
    categoryid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category'
    },
    subcategoryid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subcategory'
    },
    subcategoryname: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    stockQuantity: {
        type: Number,
        required: true
    },

    stockStatus: {
        type: String,
        enum: ["Available", "Out of Stock"],
        default: "Available"
    },
    categoryname: {
        type: String,
        required: true
    },
    reviews: [{
        userid: { type: mongoose.Schema.Types.ObjectId, ref: 'login' },
        rating: { type: Number, required: true },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now }
    }],
    averageRating: { type: Number, default: 0 }
}, { timestamps: true })
const productModel = mongoose.model("product", addproductSchema)

// Cart Schema
const cartSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'login', // Referring to the Login user ID usually, or customer ID. Let's use Login ID for consistency with User object in frontend
        required: true
    },
    products: [{
        productid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product'
        },
        quantity: {
            type: Number,
            default: 1
        }
    }]
}, { timestamps: true });
const cartModel = mongoose.model("cart", cartSchema);

// Order Schema
const orderSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'login',
        required: true
    },
    items: [{
        productid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product'
        },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number, // Price at the time of order
            required: true
        }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Paid', 'Assigned', 'Accepted', 'Dispatched', 'Delivered', 'Cancelled']
    },
    date: {
        type: Date,
        default: Date.now
    },
    paymentDetails: {
        id: String,
        status: String,
        payer: Object
    },
    deliveryBoyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'delivery',
        default: null
    },
    deliveryReview: {
        rating: Number,
        review: String
    },
    deliveryOTP: {
        type: String,
        default: null
    }
}, { timestamps: true });
const orderModel = mongoose.model("order", orderSchema);

// Offer Schema
const offerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    discount: {
        type: String, // e.g. "50% OFF"
        required: true
    },
    offerImage: {
        type: String,
        required: true
    },
    productid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        default: null
    },
    categoryid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
        default: null
    },
    subcategoryid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subcategory',
        default: null
    },
    isGlobal: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    }
}, { timestamps: true });
const offerModel = mongoose.model("offer", offerSchema);

const paymentSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'order'
    },
    paymentId: {
        type: String,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    amount: {
        type: Number,
        required: true
    },
    signature: {
        type: String
    },
    status: {
        type: String,
        default: 'pending'
    }
}, { timestamps: true });
const paymentModel = mongoose.model("payment", paymentSchema);

// Notification Schema
const notificationSchema = new mongoose.Schema({
    recipientRole: {
        type: String, // 'admin', 'shop'
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

// Leave Schema
const leaveSchema = new mongoose.Schema({
    deliveryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'delivery',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    }
}, { timestamps: true });

const leaveModel = mongoose.model("leave", leaveSchema);

module.exports = {
    customerModel,
    shopModel,
    loginModel,
    categoryModel,
    subcategoryModel,
    productModel,
    cartModel,
    orderModel,
    offerModel,
    paymentModel,
    deliveryModel,
    farmerModel,
    notificationModel,
    leaveModel
};
