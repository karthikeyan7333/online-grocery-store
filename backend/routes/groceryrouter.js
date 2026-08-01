var express = require("express");
var router = express.Router();
const {
    registerCustomer,
    registerShop,
    login,
    addCategory,
    addSubCategory,
    addProduct,
    getCategories,
    getSubCategories,
    getProducts,
    updateProductStatus,
    getAllProducts,
    getAllCategories,
    getAllSubCategories,
    getAllShops,
    addToCart,
    getCart,
    removeFromCart,
    placeOrder,
    getOrders,
    updateShopStatus,
    editCategory,
    deleteCategory,
    editSubCategory,
    deleteSubCategory,
    updateCartQuantity,
    addOffer,
    getOffers,
    deleteOffer,
    getAllOffersAdmin,
    getShopOrders,
    registerDelivery,
    updateDeliveryStatusAdmin,
    getAllDeliveryBoys,
    getDeliveryOrders,
    assignDelivery,
    updateOrderStatusDelivery,
    rateDelivery,
    updateDeliveryProfile,
    getAllOrdersAdmin,
    addProductReview,
    registerFarmer,
    updateFarmerProfile,
    getFarmerProducts,
    addFarmerProduct,
    updateFarmerStatus,
    getAllFarmers,
    editProduct,
    deleteProduct,
    getNotifications,
    markNotificationRead,
    applyLeave,
    getDeliveryLeaves,
    getAllLeaves,
    updateLeaveStatus,
    chatBot,
    getRecommendation
} = require('../controller/grocerycontroller');

// Registration Routes
router.post('/register/customer', registerCustomer);
router.post('/register/shop', registerShop);
router.post('/register/delivery', registerDelivery);
router.post('/register/farmer', registerFarmer);

// Login Route
router.post('/login', login);

// Shop Routes
router.post('/addcategory', addCategory);
router.post('/addsubcategory', addSubCategory);
router.post('/addproduct', addProduct);
router.get('/getcategories/:shopid', getCategories);
router.get('/getsubcategories/:shopid', getSubCategories);
router.get('/getproducts/:shopid', getProducts);
router.put('/updateproductstatus/:productid', updateProductStatus);
router.get('/shop/orders/:shopid', getShopOrders);
router.put('/product/edit/:productid', editProduct);
router.delete('/product/delete/:productid', deleteProduct);

// Admin Routes
router.get('/products/getall', getAllProducts); // Used by admin too
router.get('/categories/getall', getAllCategories);
router.get('/subcategories/getall', getAllSubCategories);
router.get('/shops/getall', getAllShops);
router.put('/admin/updateshopstatus', updateShopStatus);
router.put('/category/edit/:categoryid', editCategory);
router.delete('/category/delete/:categoryid', deleteCategory);
router.put('/subcategory/edit/:subcategoryid', editSubCategory);
router.delete('/subcategory/delete/:subcategoryid', deleteSubCategory);
router.get('/offer/getall', getAllOffersAdmin);
router.get('/admin/orders/getall', getAllOrdersAdmin);
router.put('/admin/updatedeliverystatus', updateDeliveryStatusAdmin);
router.get('/admin/getdeliveryboys', getAllDeliveryBoys);
router.put('/admin/assigndelivery', assignDelivery);
router.put('/admin/updatefarmerstatus', updateFarmerStatus);
router.get('/admin/getfarmers', getAllFarmers);

// Homepage Routes
router.get('/homepage/products', getAllProducts);
router.get('/homepage/offers', getOffers);
router.post('/offer/add', addOffer);
router.delete('/offer/delete/:offerid', deleteOffer);
router.put('/product/review/add', addProductReview);

// Cart Routes
router.post('/cart/add', addToCart);
router.get('/cart/get/:userid', getCart);
router.post('/cart/remove', removeFromCart);
router.put('/cart/updatequantity', updateCartQuantity);

// Order Routes
router.post('/order/place', placeOrder);
router.get('/orders/:userid', getOrders);

// Delivery Routes
router.get('/delivery/orders/:deliveryid', getDeliveryOrders); // Get assigned orders
router.put('/delivery/updatestatus', updateOrderStatusDelivery);
router.put('/delivery/rate', rateDelivery);
router.put('/delivery/updateprofile', updateDeliveryProfile);

// Leave Management Routes
router.post('/delivery/leave/apply', applyLeave);
router.get('/delivery/leave/:deliveryId', getDeliveryLeaves);
router.get('/admin/leaves', getAllLeaves);
router.put('/admin/leave/update', updateLeaveStatus);

// Farmer Routes
router.put('/farmer/updateprofile', updateFarmerProfile);
router.get('/farmer/products/:farmerid', getFarmerProducts);
router.post('/farmer/addproduct', addFarmerProduct);

// Notification Routes
router.get('/notifications/get', getNotifications);
router.put('/notifications/read', markNotificationRead);

// Chatbot Route
router.post('/chat', chatBot);

// Recommendation Route
router.get('/recommend/:productname', getRecommendation);

module.exports = router;