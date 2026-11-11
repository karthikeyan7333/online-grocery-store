const { createModel } = require("./jsonModel");

// These JSON-backed models retain the existing model names and document shape
// used by the controllers while persisting each collection under backend/data.
const customerModel = createModel("customer", {
    filename: "customers.json",
    required: ["name", "address", "phone", "dob", "age"],
    numberFields: ["age"],
    trimFields: ["name"],
    defaults: { role: "customer" },
    timestamps: true,
    dateFields: ["dob", "createdAt", "updatedAt"]
});

const deliveryModel = createModel("delivery", {
    filename: "deliveryPersonnel.json",
    required: ["name", "address", "phone", "vehicleType", "vehicleNumber"],
    trimFields: ["name"],
    defaults: { role: "delivery", status: "Pending" },
    enums: { status: ["Pending", "Approved", "Rejected"] },
    timestamps: true,
    dateFields: ["createdAt", "updatedAt"]
});

const shopModel = createModel("shop", {
    filename: "shops.json",
    required: ["shopName", "ownerName", "phone"],
    trimFields: ["shopName", "ownerName"],
    defaults: { role: "shop", status: "Pending" },
    enums: { status: ["Pending", "Approved", "Rejected"] },
    timestamps: true,
    dateFields: ["createdAt", "updatedAt"]
});

const farmerModel = createModel("farmer", {
    filename: "farmers.json",
    required: ["name", "address", "phone", "farmName"],
    trimFields: ["name"],
    defaults: { role: "farmer", status: "Pending" },
    enums: { status: ["Pending", "Approved", "Rejected"] },
    timestamps: true,
    dateFields: ["createdAt", "updatedAt"]
});

const loginModel = createModel("login", {
    filename: "users.json",
    required: ["email", "password", "role", "regType"],
    unique: ["email"],
    enums: { role: ["customer", "shop", "admin", "delivery", "farmer"], regType: ["customer", "shop", "admin", "delivery", "farmer"] },
    references: { regid: { refPath: "regType", aliases: { admin: "login" } } },
    timestamps: true,
    dateFields: ["createdAt", "updatedAt"]
});

const categoryModel = createModel("category", {
    filename: "categories.json",
    required: ["categoryname", "categoryimage", "description"],
    references: { shopid: "shop", productid: "product" },
    timestamps: true,
    dateFields: ["createdAt", "updatedAt"]
});

const subcategoryModel = createModel("subcategory", {
    filename: "subcategories.json",
    required: ["subcategoryname", "categoryid"],
    references: { categoryid: "category", shopid: "shop" },
    timestamps: true,
    dateFields: ["createdAt", "updatedAt"]
});

const productModel = createModel("product", {
    filename: "products.json",
    required: ["productname", "productimage", "description", "price", "stockQuantity", "categoryname"],
    numberFields: ["price", "stockQuantity", "averageRating", "reviews.rating"],
    defaults: { stockStatus: "Available", reviews: [], averageRating: 0 },
    enums: { stockStatus: ["Available", "Out of Stock"] },
    references: {
        shopid: "shop",
        farmerid: "farmer",
        categoryid: "category",
        subcategoryid: "subcategory",
        "reviews.userid": "login"
    },
    subdocumentArrays: ["reviews"],
    trimFields: ["productname"],
    timestamps: true,
    dateFields: ["createdAt", "updatedAt"]
});

const cartModel = createModel("cart", {
    filename: "carts.json",
    required: ["userid"],
    defaults: { products: [] },
    references: { userid: "login", "products.productid": "product" },
    numberFields: ["products.quantity"],
    subdocumentArrays: ["products"],
    timestamps: true,
    dateFields: ["createdAt", "updatedAt"]
});

const orderModel = createModel("order", {
    filename: "orders.json",
    required: ["userid", "items", "totalAmount"],
    defaults: { status: "Pending", date: () => new Date(), deliveryBoyId: null, deliveryOTP: null },
    enums: { status: ["Pending", "Paid", "Assigned", "Accepted", "Dispatched", "Delivered", "Cancelled"] },
    references: { userid: "login", "items.productid": "product", deliveryBoyId: "delivery" },
    numberFields: ["totalAmount", "items.quantity", "items.price", "deliveryReview.rating"],
    subdocumentArrays: ["items"],
    timestamps: true,
    dateFields: ["date", "createdAt", "updatedAt"]
});

const offerModel = createModel("offer", {
    filename: "offers.json",
    required: ["title", "description", "discount", "offerImage"],
    defaults: { productid: null, categoryid: null, subcategoryid: null, isGlobal: false, status: "Active" },
    booleanFields: ["isGlobal"],
    trimFields: ["title"],
    enums: { status: ["Active", "Inactive"] },
    references: { productid: "product", categoryid: "category", subcategoryid: "subcategory" },
    timestamps: true,
    dateFields: ["createdAt", "updatedAt"]
});

const paymentModel = createModel("payment", {
    filename: "payments.json",
    required: ["paymentId", "amount"],
    numberFields: ["amount"],
    defaults: { currency: "INR", status: "pending" },
    references: { orderId: "order" },
    timestamps: true,
    dateFields: ["createdAt", "updatedAt"]
});

const notificationModel = createModel("notification", {
    filename: "notifications.json",
    required: ["recipientRole", "message"],
    defaults: { recipientId: null, type: "info", read: false },
    booleanFields: ["read"],
    references: { recipientId: "shop" },
    timestamps: true,
    dateFields: ["createdAt", "updatedAt"]
});

const leaveModel = createModel("leave", {
    filename: "leaves.json",
    required: ["deliveryId", "startDate", "endDate", "reason"],
    defaults: { status: "Pending" },
    enums: { status: ["Pending", "Approved", "Rejected"] },
    references: { deliveryId: "delivery" },
    timestamps: true,
    dateFields: ["startDate", "endDate", "createdAt", "updatedAt"]
});

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
