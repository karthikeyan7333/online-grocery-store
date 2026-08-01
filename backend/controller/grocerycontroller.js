const { customerModel, shopModel, loginModel, categoryModel, subcategoryModel, productModel, cartModel, orderModel, offerModel, paymentModel, deliveryModel, farmerModel, notificationModel, leaveModel } = require("../model/grocerymodel");
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const nodemailer = require('nodemailer');

const path = require('path');
const { spawn } = require('child_process');
const { Mistral } = require("@mistralai/mistralai");

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

// Email Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendOTPMail = async (to, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: 'Your Delivery OTP - GrocyShop',
        text: `Your OTP for delivery confirmation is: ${otp}. Please share this with the delivery agent only when you receive your order.`
    };
    await transporter.sendMail(mailOptions);
};

// Helper to create notification
const createNotification = async (recipientRole, recipientId, message, type = 'info') => {
    try {
        const notification = new notificationModel({
            recipientRole,
            recipientId,
            message,
            type
        });
        await notification.save();
    } catch (error) {
        console.error("Error creating notification:", error);
    }
};

// Register Customer
exports.registerCustomer = async (req, res) => {
    try {
        const { name, address, phone, dob, age, email, password } = req.body;

        // Create Customer profile
        const newCustomer = new customerModel({
            name,
            address,
            phone,
            dob,
            age
        });
        const savedCustomer = await newCustomer.save();

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create Login entry
        const newLogin = new loginModel({
            email,
            password: hashedPassword,
            role: 'customer',
            regid: savedCustomer._id,
            regType: 'customer'
        });
        await newLogin.save();

        res.status(201).json({
            message: "Customer registered successfully",
            success: true
        });
    } catch (error) {
        res.status(500).json({
            message: "Error registering customer",
            error: error.message,
            success: false
        });
    }
};

// Register Shop
exports.registerShop = async (req, res) => {
    try {
        const { shopName, ownerName, phone, email, password } = req.body;

        // Create Shop profile
        const newShop = new shopModel({
            shopName,
            ownerName,
            phone
        });
        const savedShop = await newShop.save();

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create Login entry
        const newLogin = new loginModel({
            email,
            password: hashedPassword,
            role: 'shop',
            regid: savedShop._id,
            regType: 'shop'
        });
        await newLogin.save();

        // Notify Admin
        await createNotification('admin', null, `New Shop Registered: ${shopName}`, 'alert');

        res.status(201).json({
            message: "Shop registered successfully. Please wait for admin approval.",
            success: true
        });
    } catch (error) {
        res.status(500).json({
            message: "Error registering shop",
            error: error.message,
            success: false
        });
    }
};

// Register Delivery Boy
exports.registerDelivery = async (req, res) => {
    try {
        const { name, address, phone, vehicleType, vehicleNumber, email, password } = req.body;

        // Create Delivery profile
        const newDelivery = new deliveryModel({
            name,
            address,
            phone,
            vehicleType,
            vehicleNumber
        });
        const savedDelivery = await newDelivery.save();

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create Login entry
        const newLogin = new loginModel({
            email,
            password: hashedPassword,
            role: 'delivery',
            regid: savedDelivery._id,
            regType: 'delivery'
        });
        await newLogin.save();

        // Notify Admin
        await createNotification('admin', null, `New Delivery Boy Registered: ${name}`, 'alert');

        res.status(201).json({
            message: "Delivery boy registered successfully. Please wait for admin approval.",
            success: true
        });
    } catch (error) {
        res.status(500).json({
            message: "Error registering delivery boy",
            error: error.message,
            success: false
        });
    }
};

// Register Farmer
exports.registerFarmer = async (req, res) => {
    try {
        const { name, address, phone, farmName, email, password } = req.body;

        // Create Farmer profile
        const newFarmer = new farmerModel({
            name,
            address,
            phone,
            farmName
        });
        const savedFarmer = await newFarmer.save();

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create Login entry
        const newLogin = new loginModel({
            email,
            password: hashedPassword,
            role: 'farmer',
            regid: savedFarmer._id,
            regType: 'farmer'
        });
        await newLogin.save();

        res.status(201).json({
            message: "Farmer registered successfully. Please wait for admin approval.",
            success: true
        });
    } catch (error) {
        res.status(500).json({
            message: "Error registering farmer",
            error: error.message,
            success: false
        });
    }
};

// Update Shop Status (Approve/Reject)
exports.updateShopStatus = async (req, res) => {
    try {
        const { shopid, status } = req.body;

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status value" });
        }

        const shop = await shopModel.findByIdAndUpdate(shopid, { status }, { new: true });

        if (!shop) {
            return res.status(404).json({ success: false, message: "Shop not found" });
        }

        res.status(200).json({ success: true, message: `Shop ${status} successfully`, shop });

    } catch (error) {
        console.error("Error updating shop status:", error);
        res.status(500).json({ success: false, message: "Error updating shop status", error: error.message });
    }
};

// Update Delivery Boy Status
exports.updateDeliveryStatusAdmin = async (req, res) => {
    try {
        const { deliveryid, status } = req.body;
        const delivery = await deliveryModel.findByIdAndUpdate(deliveryid, { status }, { new: true });
        res.status(200).json({ success: true, message: `Delivery boy ${status} successfully`, delivery });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating delivery status", error: error.message });
    }
};

// Get All Delivery Boys (Admin)
exports.getAllDeliveryBoys = async (req, res) => {
    try {
        const deliveryBoys = await deliveryModel.find();
        res.status(200).json({ success: true, deliveryBoys });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching delivery boys" });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await loginModel.findOne({ email });

        if (user && user.role !== 'admin') {
            await user.populate('regid');
        }

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid password",
                success: false
            });
        }

        if (user.role === 'shop' || user.role === 'delivery' || user.role === 'farmer') {
            if (user.regid.status !== 'Approved') {
                return res.status(403).json({
                    message: `Your ${user.role} account is pending approval. Please contact admin.`,
                    success: false
                });
            }
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: user._id, role: user.role, email: user.email },
            process.env.JWT_SECRET || 'secretkey123',
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: "Login successful",
            success: true,
            token, // Send token
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                profile: user.regid
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Error during login",
            error: error.message,
            success: false
        });
    }
};

// Add Category
exports.addCategory = async (req, res) => {
    try {
        const { categoryname, description } = req.body;

        if (!req.files || !req.files.categoryimage) {
            return res.status(400).json({ success: false, message: "No image uploaded" });
        }

        const image = req.files.categoryimage;
        const imageName = Date.now() + "_" + image.name;

        // Ensure directory exists or catch error (we created it already)
        const uploadPath = path.join(__dirname, "../asset/category/", imageName);

        await image.mv(uploadPath);

        const newCategory = new categoryModel({
            categoryname,
            description,
            categoryimage: imageName
        });

        await newCategory.save();
        res.status(201).json({ success: true, message: "Category added successfully", category: newCategory });

    } catch (error) {
        console.error("Error adding category:", error);
        res.status(500).json({ success: false, message: "Error adding category", error: error.message });
    }
};

// Edit Category
exports.editCategory = async (req, res) => {
    try {
        const { categoryid } = req.params;
        const { categoryname, description } = req.body;

        let updateData = { categoryname, description };

        if (req.files && req.files.categoryimage) {
            const image = req.files.categoryimage;
            const imageName = Date.now() + "_" + image.name;
            const uploadPath = path.join(__dirname, "../asset/category/", imageName);
            await image.mv(uploadPath);
            updateData.categoryimage = imageName;
        }

        const updatedCategory = await categoryModel.findByIdAndUpdate(categoryid, updateData, { new: true });

        if (!updatedCategory) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        res.status(200).json({ success: true, message: "Category updated successfully", category: updatedCategory });

    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ success: false, message: "Error updating category", error: error.message });
    }
};

// Delete Category
exports.deleteCategory = async (req, res) => {
    try {
        const { categoryid } = req.params;
        const deletedCategory = await categoryModel.findByIdAndDelete(categoryid);

        if (!deletedCategory) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        res.status(200).json({ success: true, message: "Category deleted successfully" });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ success: false, message: "Error deleting category", error: error.message });
    }
};

// Chatbot
exports.chatBot = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: "Message is required" });
        }

        // 1. Identify User (Optional)
        let userContext = "User is a guest (not logged in).";
        let orderContext = "No active order found.";

        const token = req.headers.authorization?.split(" ")[1];
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'groceryappsecretkey123');
                const userId = decoded.id;

                // Fetch latest order
                const latestOrder = await orderModel.findOne({ userid: userId }).sort({ createdAt: -1 });

                userContext = `User ID: ${userId}. Role: ${decoded.role}`;
                if (latestOrder) {
                    orderContext = `Latest Order Details:
                    - Order ID: ${latestOrder._id}
                    - Status: ${latestOrder.status}
                    - Total Price: ${latestOrder.totalPrice}
                    - Items: ${latestOrder.items?.length || 0} items
                    - Date: ${latestOrder.createdAt.toDateString()}`;
                } else {
                    orderContext = "User has no past orders.";
                }
            } catch (err) {
                console.log("Chatbot token verification failed (ignoring):", err.message);
            }
        }

        try {
            // Updated to use Mistral AI
            const chatResponse = await mistral.chat.complete({
                model: 'mistral-large-latest',
                messages: [
                    {
                        role: 'system', content: `You are a helpful customer support assistant for GrocyShop.
                    
                    CONTEXT:
                    ${userContext}
                    ${orderContext}

                    INSTRUCTIONS:
                    1. If the user asks for **products**, **vegetables**, or **items**, strictly include: [View All Items](/#shop).
                    2. If the user asks for **shops**, **stores**, or **vendors**, strictly include: [View All Shops](/#stores).
                    3. If the user asks for **farmers**, **farm products**, or **local growers**, strictly include: [View Farmers](/#farmers).
                    4. If the user asks for **categories**, **departments**, or specific types like 'Fruits', strictly include: [Explore Categories](/#categories).
                    5. If the user asks about **support**, **contact**, or **help**, strictly include: [Contact Support](/#contact).
                    6. If the user asks about **cart** or **checkout**, strictly include: [Go to Cart](/cart).
                    7. If the user asks about **offers** or **deals**, strictly include: [View Offers](/#deals).
                    8. If the user asks about **delivery tracking** or **order status**:
                       - If CONTEXT has order details: Provide status/details.
                       - If NO order details (Guest): Ask to login. STRICTLY include: 
                         [Login to Account](/login)
                         [Register New Account](/register)
                    7. Be polite, concise, and helpful.
                    ` },
                    { role: 'user', content: message }
                ],
            });

            const reply = chatResponse.choices[0].message.content;
            res.status(200).json({ success: true, reply: reply });

        } catch (apiError) {
            console.error("Mistral AI API Error (falling back to local):", apiError.message);

            // Local Fallback Logic
            let reply = "I'm currently unable to access my advanced AI features, but I can still help! We sell fresh groceries, vegetables, and daily essentials.";
            const msg = message.toLowerCase();

            if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey')) {
                reply = "Hello! Welcome to GrocyShop. How can I assist you with your grocery shopping today?";
            } else if (msg.includes('order') || msg.includes('track')) {
                reply = "You can track your orders in the 'My Orders' section of your profile. We deliver promptly!";
            } else if (msg.includes('delivery') || msg.includes('cancel')) {
                reply = "We offer same-day delivery for most locations. You can cancel orders before they are dispatched.";
            } else if (msg.includes('vegetable') || msg.includes('fruit') || msg.includes('fresh')) {
                reply = "We have fresh organic vegetables and fruits! [Explore Categories](/#categories)";
            } else if (msg.includes('offer') || msg.includes('deal') || msg.includes('discount')) {
                reply = "Check out our latest savings and limited-time offers! [View Offers](/#deals)";
            } else if (msg.includes('payment') || msg.includes('refund')) {
                reply = "We accept all major credit cards, UPI, and Cash on Delivery. Refunds are processed within 3-5 business days.";
            } else if (msg.includes('milk') || msg.includes('dairy')) {
                reply = "Our dairy products are fresh and sourced daily. Be sure to buy them quickly as they sell out fast!";
            }

            res.status(200).json({ success: true, reply: reply });
        }

    } catch (error) {
        console.error("Chatbot Critical Error:", error);
        res.status(500).json({ success: false, message: "Error processing chat request", error: error.message });
    }
};


exports.addProduct = async (req, res) => {
    try {
        console.log("Adding product, body:", req.body);
        const {
            productname,
            categoryname,
            categoryid,
            subcategoryname,
            subcategoryid,
            description,
            price,
            stockQuantity,
            shopid
        } = req.body;

        if (!req.files || !req.files.productimage) {
            return res.status(400).json({ success: false, message: "Product image required" });
        }

        const image = req.files.productimage;
        const imageName = Date.now() + "_" + image.name;
        const uploadPath = path.join(__dirname, "../asset/product/", imageName);

        // move image
        await image.mv(uploadPath);

        const stockStatus = stockQuantity > 0 ? "Available" : "Out of Stock";

        const product = new productModel({
            productname,
            productimage: imageName,
            categoryname,
            categoryid,
            subcategoryname,
            subcategoryid,
            description,
            price,
            stockQuantity,
            stockStatus,
            shopid
        });

        await product.save();

        // Notify Admin about new product
        await createNotification('admin', null, `New Product Added: ${productname} by ${shopid ? 'Shop' : 'Farmer'}`, 'info');

        res.status(201).json({
            success: true,
            message: "Product added successfully",
            product
        });

    } catch (error) {
        console.error("Add product error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add product",
            error: error.message
        });
    }
};

// Add SubCategory
exports.addSubCategory = async (req, res) => {
    try {
        const { subcategoryname, categoryid } = req.body;

        if (!req.files || !req.files.subcategoryimage) {
            return res.status(400).json({ success: false, message: "Subcategory image is required" });
        }

        if (!subcategoryname || !categoryid) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const image = req.files.subcategoryimage;
        const imageName = Date.now() + "_" + image.name;
        // Ensure folder exists or just assign path (assuming node moves it or creates if not strict)
        // Based on previous code, we just do image.mv
        const uploadPath = path.join(__dirname, "../asset/subcategory/", imageName);

        await image.mv(uploadPath);

        const newSubCategory = new subcategoryModel({
            subcategoryname,
            categoryid,
            subcategoryimage: imageName
        });

        await newSubCategory.save();
        res.status(201).json({ success: true, message: "Subcategory added successfully", subcategory: newSubCategory });

    } catch (error) {
        console.error("Error adding subcategory:", error);
        res.status(500).json({ success: false, message: "Error adding subcategory", error: error.message });
    }
};

// Edit SubCategory
exports.editSubCategory = async (req, res) => {
    try {
        const { subcategoryid } = req.params;
        const { subcategoryname, categoryid } = req.body;

        let updateData = { subcategoryname, categoryid };

        if (req.files && req.files.subcategoryimage) {
            const image = req.files.subcategoryimage;
            const imageName = Date.now() + "_" + image.name;
            const uploadPath = path.join(__dirname, "../asset/subcategory/", imageName);
            await image.mv(uploadPath);
            updateData.subcategoryimage = imageName;
        }

        const updatedSubCategory = await subcategoryModel.findByIdAndUpdate(subcategoryid, updateData, { new: true });

        if (!updatedSubCategory) {
            return res.status(404).json({ success: false, message: "Subcategory not found" });
        }

        res.status(200).json({ success: true, message: "Subcategory updated successfully", subcategory: updatedSubCategory });

    } catch (error) {
        console.error("Error updating subcategory:", error);
        res.status(500).json({ success: false, message: "Error updating subcategory", error: error.message });
    }
};

// Delete SubCategory
exports.deleteSubCategory = async (req, res) => {
    try {
        const { subcategoryid } = req.params;
        const deletedSubCategory = await subcategoryModel.findByIdAndDelete(subcategoryid);

        if (!deletedSubCategory) {
            return res.status(404).json({ success: false, message: "Subcategory not found" });
        }

        res.status(200).json({ success: true, message: "Subcategory deleted successfully" });
    } catch (error) {
        console.error("Error deleting subcategory:", error);
        res.status(500).json({ success: false, message: "Error deleting subcategory", error: error.message });
    }
};

// Get SubCategories by Shop ID
exports.getSubCategories = async (req, res) => {
    try {
        const { shopid } = req.params;
        const subcategories = await subcategoryModel.find({ shopid }).populate('categoryid', 'categoryname');
        res.status(200).json({ success: true, subcategories });
    } catch (error) {
        console.error("Error fetching subcategories:", error);
        res.status(500).json({ success: false, message: "Error fetching subcategories", error: error.message });
    }
};
// Get Categories by Shop ID
exports.getCategories = async (req, res) => {
    try {
        const { shopid } = req.params;
        const categories = await categoryModel.find({ shopid });
        res.status(200).json({ success: true, categories });
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ success: false, message: "Error fetching categories", error: error.message });
    }
};

// Get Products by Shop ID
exports.getProducts = async (req, res) => {
    try {
        const { shopid } = req.params;
        const products = await productModel.find({ shopid });
        res.status(200).json({ success: true, products });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ success: false, message: "Error fetching products", error: error.message });
    }
};

// GetAll endpoints for Homepage
exports.getAllProducts = async (req, res) => {
    try {
        let products = await productModel.find()
            .populate('shopid', 'shopName')
            .populate('farmerid', 'farmName name')
            .populate('categoryid')
            .populate('subcategoryid')
            .populate({
                path: 'reviews.userid',
                select: 'email role',
                populate: {
                    path: 'regid',
                    select: 'name'
                }
            });

        // Filter: 
        // 1. Milk/Meat/Fish disappear 1 day after adding.
        // 2. Others stay visible even if stock is 0 (marked Out of Stock).
        const now = new Date();
        const ONE_DAY = 24 * 60 * 60 * 1000;

        products = products.filter(product => {
            const catName = product.categoryname ? product.categoryname.toLowerCase() : "";
            // Perishable check
            if (["milk", "meat", "fish"].includes(catName)) {
                if (product.createdAt) {
                    const created = new Date(product.createdAt);
                    if (now - created > ONE_DAY) {
                        return false; // Remove expired perishable
                    }
                }
            }
            return true;
        });

        res.status(200).json({ success: true, products });
    } catch (error) {
        console.error("Error fetching all products:", error);
        res.status(500).json({ success: false, message: "Error fetching all products", error: error.message });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await categoryModel.find().populate('shopid', 'shopName');
        res.status(200).json({ success: true, categories });
    } catch (error) {
        console.error("Error fetching all categories:", error);
        res.status(500).json({ success: false, message: "Error fetching all categories", error: error.message });
    }
};

exports.getAllSubCategories = async (req, res) => {
    try {
        const subcategories = await subcategoryModel.find().populate('categoryid').populate('shopid', 'shopName');
        res.status(200).json({ success: true, subcategories });
    } catch (error) {
        console.error("Error fetching all subcategories:", error);
        res.status(500).json({ success: false, message: "Error fetching all subcategories", error: error.message });
    }
};

exports.getAllShops = async (req, res) => {
    try {
        const shops = await shopModel.find();
        res.status(200).json({ success: true, shops });
    } catch (error) {
        console.error("Error fetching all shops:", error);
        res.status(500).json({ success: false, message: "Error fetching all shops", error: error.message });
    }
};

// Update Product Status
exports.updateProductStatus = async (req, res) => {
    try {
        const { productid } = req.params;
        const { stockStatus } = req.body;

        const updatedProduct = await productModel.findByIdAndUpdate(
            productid,
            { stockStatus },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.status(200).json({ success: true, message: "Status updated successfully", product: updatedProduct });
    } catch (error) {
        console.error("Error updating product status:", error);
        res.status(500).json({ success: false, message: "Error updating status", error: error.message });
    }
};

// Edit Product (Update Stock/Details)
exports.editProduct = async (req, res) => {
    try {
        const { productid } = req.params;
        const {
            productname,
            description,
            price,
            stockQuantity,
            stockStatus
        } = req.body;

        let updateData = {};
        if (productname) updateData.productname = productname;
        if (description) updateData.description = description;
        if (price) updateData.price = price;

        if (stockQuantity !== undefined) {
            const qty = Number(stockQuantity);
            if (!isNaN(qty)) {
                updateData.stockQuantity = qty;
                updateData.createdAt = Date.now();
                if (qty <= 0) {
                    updateData.stockStatus = "Out of Stock";
                    // Notify Shop Owner
                    const prod = await productModel.findById(productid).populate('shopid');
                    if (prod && prod.shopid) {
                        createNotification('shop', prod.shopid._id, `Product Out of Stock: ${prod.productname}`, 'warning');
                    }
                    // Notify Admin
                    createNotification('admin', null, `Product Out of Stock: ${prod ? prod.productname : 'Unknown Product'}`, 'warning');
                } else if (stockStatus === "Available" || (!stockStatus && qty > 0)) {
                    // If user explicitly said Available OR didn't say anything and qty > 0
                    updateData.stockStatus = "Available";
                }
            }
        }

        // If stockStatus is explicitly manually updated
        if (stockStatus) {
            updateData.stockStatus = stockStatus;
        }

        if (req.files && req.files.productimage) {
            const image = req.files.productimage;
            const imageName = Date.now() + "_" + image.name;
            const uploadPath = path.join(__dirname, "../asset/product/", imageName);
            await image.mv(uploadPath);
            updateData.productimage = imageName;
        }

        const updatedProduct = await productModel.findByIdAndUpdate(productid, updateData, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.status(200).json({ success: true, message: "Product updated successfully", product: updatedProduct });

    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ success: false, message: "Error updating product", error: error.message });
    }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
    try {
        const { productid } = req.params;
        const deletedProduct = await productModel.findByIdAndDelete(productid);

        if (!deletedProduct) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.status(200).json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ success: false, message: "Error deleting product", error: error.message });
    }
};

// --- CART & ORDER LOGIC ---

// Add to Cart
exports.addToCart = async (req, res) => {
    try {
        const { userid, productid, quantity = 1 } = req.body;

        const product = await productModel.findById(productid);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        let cart = await cartModel.findOne({ userid });

        if (!cart) {
            if (quantity > product.stockQuantity) {
                return res.status(400).json({ success: false, message: `Only ${product.stockQuantity} items left in stock` });
            }
            cart = new cartModel({
                userid,
                products: [{ productid, quantity }]
            });
        } else {
            // Check if product exists in cart
            const productIndex = cart.products.findIndex(p => p.productid.toString() === productid);
            if (productIndex > -1) {
                // Check if adding quantity exceeds stock
                if (cart.products[productIndex].quantity + quantity > product.stockQuantity) {
                    return res.status(400).json({ success: false, message: `Cannot add more. Only ${product.stockQuantity} items in stock.` });
                }
                // If exists, update quantity (or could be increment: cart.products[productIndex].quantity += quantity)
                // Assuming "Add to Cart" usually increments in this context
                cart.products[productIndex].quantity += quantity;
            } else {
                if (quantity > product.stockQuantity) {
                    return res.status(400).json({ success: false, message: `Only ${product.stockQuantity} items left in stock` });
                }
                cart.products.push({ productid, quantity });
            }
        }

        await cart.save();
        res.status(200).json({ success: true, message: "Product added to cart", cart });

    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ success: false, message: "Error adding to cart", error: error.message });
    }
};

// Get Cart
exports.getCart = async (req, res) => {
    try {
        const { userid } = req.params;
        const cart = await cartModel.findOne({ userid }).populate({
            path: 'products.productid',
            populate: [
                { path: 'categoryid' },
                { path: 'subcategoryid' }
            ]
        });

        if (!cart) {
            return res.status(200).json({ success: true, cart: { products: [] } }); // Return empty cart if none exists
        }

        res.status(200).json({ success: true, cart });
    } catch (error) {
        console.error("Error fetching cart:", error);
        res.status(500).json({ success: false, message: "Error fetching cart", error: error.message });
    }
};

// Remove from Cart
exports.removeFromCart = async (req, res) => {
    try {
        const { userid, productid } = req.body;
        let cart = await cartModel.findOne({ userid });

        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        cart.products = cart.products.filter(p => p.productid.toString() !== productid);
        await cart.save();

        res.status(200).json({ success: true, message: "Product removed from cart", cart });

    } catch (error) {
        console.error("Error removing from cart", error);
        res.status(500).json({ success: false, message: "Error removing from cart" });
    }
}

// Update Cart Quantity
exports.updateCartQuantity = async (req, res) => {
    try {
        const { userid, productid, quantity } = req.body;

        const product = await productModel.findById(productid);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        if (quantity > product.stockQuantity) {
            return res.status(400).json({ success: false, message: `Only ${product.stockQuantity} items available in stock` });
        }

        let cart = await cartModel.findOne({ userid });

        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        const productIndex = cart.products.findIndex(p => p.productid.toString() === productid);

        if (productIndex > -1) {
            cart.products[productIndex].quantity = quantity;
            if (cart.products[productIndex].quantity <= 0) {
                cart.products.splice(productIndex, 1);
            }
        }

        await cart.save();
        res.status(200).json({ success: true, message: "Cart updated", cart });

    } catch (error) {
        console.error("Error updating cart quantity:", error);
        res.status(500).json({ success: false, message: "Error updating cart quantity" });
    }
};

// Place Order
// Place Order
exports.placeOrder = async (req, res) => {
    try {
        const { userid, totalAmount, items, type, paymentDetails } = req.body; // type: 'single_buy' or 'cart_checkout'

        // 1. Create Order
        const newOrder = new orderModel({
            userid,
            items,
            totalAmount,
            status: paymentDetails ? 'Paid' : 'Pending',
            paymentDetails: paymentDetails || {}
        });

        await newOrder.save();

        // 2. Save Payment Details if Razorpay
        if (paymentDetails && paymentDetails.razorpay_payment_id) {
            try {
                const newPayment = new paymentModel({
                    orderId: newOrder._id,
                    paymentId: paymentDetails.razorpay_payment_id,
                    amount: totalAmount,
                    currency: 'INR',
                    signature: paymentDetails.razorpay_signature,
                    status: 'success'
                });
                await newPayment.save();
            } catch (payErr) {
                console.error("Error saving payment record:", payErr);
                // We don't fail the order if payment record save fails, but logging it is important.
            }
        }

        // 3. Reduce Stock
        for (const item of items) {
            const product = await productModel.findById(item.productid);
            if (product) {
                const currentStock = Number(product.stockQuantity);
                const orderQty = Number(item.quantity);

                if (!isNaN(currentStock) && !isNaN(orderQty)) {
                    product.stockQuantity = currentStock - orderQty;
                    if (product.stockQuantity <= 0) {
                        product.stockQuantity = 0;
                        product.stockStatus = 'Out of Stock';

                        // Notify Shop Owner
                        if (product.shopid) {
                            createNotification('shop', product.shopid, `Alert: ${product.productname} is Out of Stock!`, 'warning');
                        }
                        // Notify Admin
                        createNotification('admin', null, `Product Out of Stock: ${product.productname}`, 'warning');
                    }
                    await product.save();
                }
            }
        }

        // 4. Update Cart
        if (type === 'single_buy') {
            // Remove specific items from cart
            for (const item of items) {
                await cartModel.findOneAndUpdate(
                    { userid },
                    { $pull: { products: { productid: item.productid } } }
                );
            }
        } else {
            // Default: Clear entire cart (cart_checkout)
            await cartModel.findOneAndDelete({ userid });
        }

        res.status(201).json({ success: true, message: "Order placed successfully!", order: newOrder });

    } catch (error) {
        console.error("Error placing order:", error);
        res.status(500).json({ success: false, message: "Failed to place order", error: error.message });
    }
};
// Get All Orders (Admin)
exports.getAllOrdersAdmin = async (req, res) => {
    try {
        const orders = await orderModel.find()
            .populate({
                path: 'userid',
                populate: { path: 'regid' }
            })
            .populate('items.productid')
            .populate('deliveryBoyId')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error("Error fetching all orders:", error);
        res.status(500).json({ success: false, message: "Error fetching orders", error: error.message });
    }
};

// Get Orders
exports.getOrders = async (req, res) => {
    try {
        const { userid } = req.params;
        const orders = await orderModel.find({ userid }).populate('items.productid').populate('deliveryBoyId').sort({ createdAt: -1 });

        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ success: false, message: "Error fetching orders", error: error.message });
    }
};

// Create Default Admin
exports.createAdmin = async () => {
    try {
        const adminEmail = "admin@gmail.com";
        const adminPassword = "admin";

        const existingAdmin = await loginModel.findOne({ email: adminEmail });

        if (!existingAdmin) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);

            const newAdmin = new loginModel({
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                regType: 'admin'
            });

            await newAdmin.save();
            console.log("Default Admin created: admin@gmail.com / admin");
        }
    } catch (error) {
        console.error("Error creating admin account:", error);
    }
};
// --- OFFERS & DEALS ---
exports.addOffer = async (req, res) => {
    try {
        const { title, description, discount, productid, categoryid, subcategoryid, isGlobal } = req.body;

        if (!req.files || !req.files.offerImage) {
            return res.status(400).json({ success: false, message: "Offer image is required" });
        }

        const image = req.files.offerImage;
        const imageName = Date.now() + "_" + image.name;
        // Assuming asset/offer directory exists or will be created
        // We might need to ensure the directory exists, but for now we follow the pattern
        const uploadPath = path.join(__dirname, "../asset/offer/", imageName);

        await image.mv(uploadPath);

        const newOffer = new offerModel({
            title,
            description,
            discount,
            offerImage: imageName,
            productid: productid ? productid : null,
            categoryid: categoryid ? categoryid : null,
            subcategoryid: subcategoryid ? subcategoryid : null,
            isGlobal: isGlobal === 'true' || isGlobal === true
        });

        await newOffer.save();
        res.status(201).json({ success: true, message: "Offer added successfully", offer: newOffer });

    } catch (error) {
        console.error("Error adding offer:", error);
        res.status(500).json({ success: false, message: "Error adding offer", error: error.message });
    }
};

exports.getOffers = async (req, res) => {
    try {
        const offers = await offerModel.find({ status: 'Active' }).populate('productid').populate('categoryid').populate('subcategoryid');
        res.status(200).json({ success: true, offers });
    } catch (error) {
        console.error("Error fetching offers:", error);
        res.status(500).json({ success: false, message: "Error fetching offers", error: error.message });
    }
};

exports.deleteOffer = async (req, res) => {
    try {
        const { id } = req.params;
        await offerModel.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Offer deleted successfully" });
    } catch (error) {
        console.error("Error deleting offer:", error);
        res.status(500).json({ success: false, message: "Error deleting offer", error: error.message });
    }
};

exports.getAllOffersAdmin = async (req, res) => {
    try {
        const offers = await offerModel.find().populate('productid').populate('categoryid').populate('subcategoryid');
        res.status(200).json({ success: true, offers });
    } catch (error) {
        console.error("Error fetching all offers:", error);
        res.status(500).json({ success: false, message: "Error fetching all offers", error: error.message });
    }
};

// --- SHOP ORDERS ---
exports.getShopOrders = async (req, res) => {
    try {
        const { shopid } = req.params;

        // Find all orders and populate product details to check shopid
        const orders = await orderModel.find()
            .populate({
                path: 'items.productid',
                populate: { path: 'shopid' } // Populate shop to check ID
            })
            .populate({
                path: 'userid',
                populate: { path: 'regid' } // Deep populate to get customer details from customerModel via login
            })
            .sort({ createdAt: -1 });

        // Filter orders to find those containing products from this shop
        const shopOrders = orders.reduce((acc, order) => {
            const shopItems = order.items.filter(item =>
                item.productid && item.productid.shopid && item.productid.shopid._id.toString() === shopid
            );

            if (shopItems.length > 0) {
                // Create a simplified order object for the shop view
                const shopOrder = {
                    _id: order._id,
                    customer: {
                        name: order.userid.regid.name,
                        address: order.userid.regid.address,
                        phone: order.userid.regid.phone,
                        email: order.userid.email
                    },
                    status: order.status,
                    date: order.createdAt,
                    totalAmount: order.totalAmount, // Note: This is order total, not just shop total. 
                    // You might want to calculate shop-specific total if needed.
                    shopTotal: shopItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                    items: shopItems.map(item => ({
                        productname: item.productid.productname,
                        quantity: item.quantity,
                        price: item.price,
                        image: item.productid.productimage
                    }))
                };
                acc.push(shopOrder);
            }
            return acc;
        }, []);

        res.status(200).json({ success: true, orders: shopOrders });

    } catch (error) {
        console.error("Error fetching shop orders:", error);
        res.status(500).json({ success: false, message: "Error fetching shop orders", error: error.message });
    }
};

// --- DELIVERY BOY DASHBOARD CONTROLLERS ---

// Get Deliveries assigned to this boy
exports.getDeliveryOrders = async (req, res) => {
    try {
        const { deliveryBoyId } = req.params;
        // Fetch ONLY orders assigned to this boy
        const orders = await orderModel.find({
            deliveryBoyId: deliveryBoyId
        }).populate({
            path: 'userid',
            populate: { path: 'regid' }
        }).populate('items.productid');

        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching delivery orders" });
    }
};

// Assign Delivery to Boy
exports.assignDelivery = async (req, res) => {
    try {
        const { orderId, deliveryBoyId } = req.body;
        const order = await orderModel.findByIdAndUpdate(
            orderId,
            { deliveryBoyId, status: 'Assigned' },
            { new: true }
        );
        res.status(200).json({ success: true, message: "Delivery assigned successfully", order });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error assigning delivery" });
    }
};

// Update Order Status (by Delivery Boy)
exports.updateOrderStatusDelivery = async (req, res) => {
    try {
        const { orderId, status, otp } = req.body; // status: 'Dispatched', 'Delivered', 'Cancelled'

        let updateData = { status };

        // Find order first to check logic
        const existingOrder = await orderModel.findById(orderId).populate('userid');

        if (!existingOrder) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (status === 'Dispatched') {
            // Generate OTP
            const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
            updateData.deliveryOTP = newOtp;

            // Send Email
            if (existingOrder.userid && existingOrder.userid.email) {
                try {
                    await sendOTPMail(existingOrder.userid.email, newOtp);
                } catch (emailErr) {
                    console.error("Failed to send OTP email:", emailErr);
                }
            }
        }

        if (status === 'Delivered') {
            if (!otp) {
                return res.status(400).json({ success: false, message: "OTP is required for delivery confirmation" });
            }
            if (existingOrder.deliveryOTP !== otp) {
                return res.status(400).json({ success: false, message: "Invalid OTP" });
            }
        }

        const order = await orderModel.findByIdAndUpdate(orderId, updateData, { new: true });
        res.status(200).json({ success: true, message: `Order marked as ${status}`, order });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ success: false, message: "Error updating order status" });
    }
};

// Rate Delivery (by Customer)
exports.rateDelivery = async (req, res) => {
    try {
        const { orderId, rating, review } = req.body;
        const order = await orderModel.findByIdAndUpdate(
            orderId,
            { deliveryReview: { rating, review } },
            { new: true }
        );
        res.status(200).json({ success: true, message: "Delivery reviewed successfully", order });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error rating delivery" });
    }
};

// Update Delivery Profile
exports.updateDeliveryProfile = async (req, res) => {
    try {
        const { deliveryid, name, address, phone, vehicleType, vehicleNumber, email, password } = req.body;

        const updatedDelivery = await deliveryModel.findByIdAndUpdate(deliveryid, {
            name, address, phone, vehicleType, vehicleNumber
        }, { new: true });

        const updateData = {};
        if (email) updateData.email = email;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const updatedLogin = await loginModel.findOneAndUpdate({ regid: deliveryid }, updateData, { new: true });

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: updatedLogin._id,
                email: updatedLogin.email,
                role: updatedLogin.role,
                profile: updatedDelivery
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating profile", error: error.message });
    }
};

// Add Product Review
exports.addProductReview = async (req, res) => {
    try {
        const { productid, userid, rating, comment } = req.body;

        if (!productid || !userid || !rating) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const product = await productModel.findById(productid);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        let reviews = product.reviews || [];
        const existingReviewIndex = reviews.findIndex(r => r.userid && r.userid.toString() === userid.toString());

        if (existingReviewIndex > -1) {
            reviews[existingReviewIndex].rating = Number(rating);
            reviews[existingReviewIndex].comment = comment;
            reviews[existingReviewIndex].createdAt = Date.now();
        } else {
            reviews.push({ userid, rating: Number(rating), comment });
        }

        let averageRating = 0;
        if (reviews.length > 0) {
            const totalRating = reviews.reduce((sum, item) => sum + Number(item.rating), 0);
            averageRating = Number((totalRating / reviews.length).toFixed(1));
        }

        // Use findByIdAndUpdate to bypass validation of other fields (like stockQuantity)
        const updatedProduct = await productModel.findByIdAndUpdate(
            productid,
            { reviews, averageRating },
            { new: true, runValidators: false } // runValidators: false is key here
        );

        res.status(200).json({ success: true, message: "Review added successfully", product: updatedProduct });
    } catch (error) {
        console.error("Error adding product review:", error);
        res.status(500).json({ success: false, message: "Error adding review", error: error.message });
    }
};

// Update Farmer Profile
exports.updateFarmerProfile = async (req, res) => {
    try {
        const { farmerid, name, address, phone, farmName, email, password } = req.body;

        const updatedFarmer = await farmerModel.findByIdAndUpdate(farmerid, {
            name, address, phone, farmName
        }, { new: true });

        const updateData = {};
        if (email) updateData.email = email;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const updatedLogin = await loginModel.findOneAndUpdate({ regid: farmerid }, updateData, { new: true });

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: updatedLogin._id,
                email: updatedLogin.email,
                role: updatedLogin.role,
                profile: updatedFarmer
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating profile", error: error.message });
    }
};

// Get Products by Farmer ID
exports.getFarmerProducts = async (req, res) => {
    try {
        const { farmerid } = req.params;
        const products = await productModel.find({ farmerid });
        res.status(200).json({ success: true, products });
    } catch (error) {
        console.error("Error fetching farmer products:", error);
        res.status(500).json({ success: false, message: "Error fetching products", error: error.message });
    }
};

// Add Farmer Product
exports.addFarmerProduct = async (req, res) => {
    try {
        const { productname, description, price, stockQuantity, categoryid, subcategoryid, categoryname, subcategoryname, farmerid } = req.body;

        if (!req.files || !req.files.productimage) {
            return res.status(400).json({ success: false, message: "Product image is required" });
        }

        const image = req.files.productimage;
        const imageName = Date.now() + "_" + image.name;
        const uploadPath = path.join(__dirname, "../asset/product/", imageName);

        await image.mv(uploadPath);

        const newProduct = new productModel({
            productname,
            description,
            price,
            stockQuantity,
            categoryid,
            subcategoryid,
            categoryname,
            subcategoryname,
            farmerid,
            productimage: imageName
        });

        await newProduct.save();
        res.status(201).json({ success: true, message: "Product added successfully", product: newProduct });

    } catch (error) {
        console.error("Error adding farmer product:", error);
        res.status(500).json({ success: false, message: "Error adding product", error: error.message });
    }
};

// Update Farmer Status (Approve/Reject)
exports.updateFarmerStatus = async (req, res) => {
    try {
        const { farmerid, status } = req.body;
        const farmer = await farmerModel.findByIdAndUpdate(farmerid, { status }, { new: true });
        res.status(200).json({ success: true, message: `Farmer status updated to ${status}`, farmer });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating farmer status" });
    }
};

// Get All Farmers (Admin)
exports.getAllFarmers = async (req, res) => {
    try {
        const farmers = await farmerModel.find();
        res.status(200).json({ success: true, farmers });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching farmers" });
    }
};

// --- NOTIFICATIONS ---
exports.getNotifications = async (req, res) => {
    try {
        const { role, id } = req.query; // role: admin/shop, id: shopid (optional for admin)

        let query = {};
        if (role === 'admin') {
            query = { recipientRole: 'admin' };
        } else if (role === 'shop') {
            if (!id) return res.status(400).json({ success: false, message: "Shop ID required" });
            query = { recipientRole: 'shop', recipientId: id };
        } else {
            return res.status(400).json({ success: false, message: "Invalid role" });
        }

        const notifications = await notificationModel.find(query).sort({ createdAt: -1 }).limit(50);
        const unreadCount = await notificationModel.countDocuments({ ...query, read: false });

        res.status(200).json({ success: true, notifications, unreadCount });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching notifications" });
    }
};

exports.markNotificationRead = async (req, res) => {
    try {
        const { id } = req.body; // notification id or 'all'
        const { role, shopid } = req.body; // context to mark all

        if (id === 'all') {
            let query = {};
            if (role === 'admin') {
                query = { recipientRole: 'admin', read: false };
            } else if (role === 'shop') {
                if (!shopid) return res.status(400).json({ success: false, message: "Shop ID required" });
                query = { recipientRole: 'shop', recipientId: shopid, read: false };
            }
            await notificationModel.updateMany(query, { read: true });
        } else {
            await notificationModel.findByIdAndUpdate(id, { read: true });
        }
        res.status(200).json({ success: true, message: "Marked as read" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating notification" });
    }
};

// --- LEAVE MANAGEMENT ---
exports.applyLeave = async (req, res) => {
    try {
        const { deliveryId, startDate, endDate, reason } = req.body;
        const newLeave = new leaveModel({ deliveryId, startDate, endDate, reason });
        await newLeave.save();

        // Notify Admin
        await createNotification('admin', null, `New Leave Request from Delivery Boy`, 'info');

        res.status(201).json({ success: true, message: "Leave application submitted", leave: newLeave });
    } catch (error) {
        console.error("Error applying leave:", error);
        res.status(500).json({ success: false, message: "Error applying leave", error: error.message });
    }
};

exports.getDeliveryLeaves = async (req, res) => {
    try {
        const { deliveryId } = req.params;
        const leaves = await leaveModel.find({ deliveryId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, leaves });
    } catch (error) {
        console.error("Error fetching leaves:", error);
        res.status(500).json({ success: false, message: "Error fetching leaves", error: error.message });
    }
};

exports.getAllLeaves = async (req, res) => {
    try {
        const leaves = await leaveModel.find().populate('deliveryId', 'name').sort({ createdAt: -1 });
        res.status(200).json({ success: true, leaves });
    } catch (error) {
        console.error("Error fetching all leaves:", error);
        res.status(500).json({ success: false, message: "Error fetching leaves", error: error.message });
    }
};

exports.updateLeaveStatus = async (req, res) => {
    try {
        const { leaveId, status } = req.body;
        const leave = await leaveModel.findByIdAndUpdate(leaveId, { status }, { new: true });

        res.status(200).json({ success: true, message: `Leave ${status}`, leave });
    } catch (error) {
        console.error("Error updating leave status:", error);
        res.status(500).json({ success: false, message: "Error updating leave", error: error.message });
    }
};

// --- PRODUCT RECOMMENDATION ---
exports.getRecommendation = async (req, res) => {
    try {
        const { productname } = req.params;
        console.log("Getting recommendations for:", productname);

        const pythonProcess = spawn('python', [
            path.join(__dirname, '../recommend.py'),
            productname
        ]);

        let dataString = '';

        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        pythonProcess.on('close', async (code) => {
            if (code !== 0) {
                console.error("Python process exited with code", code);
                return res.status(500).json({ error: "Recommendation script failed" });
            }
            try {
                if (!dataString.trim()) {
                    return res.json([]);
                }
                const recommendations = JSON.parse(dataString);

                if (!Array.isArray(recommendations)) {
                    return res.json([]);
                }

                // Fetch product details for these recommendations from DB
                // Use case-insensitive regex for better matching
                const recommendedProducts = await productModel.find({
                    productname: { $in: recommendations.map(name => new RegExp(name, "i")) }
                }).limit(5)
                    .populate('shopid', 'shopName')
                    .populate('farmerid', 'farmName name');

                res.json({
                    success: true,
                    products: recommendedProducts
                });
            } catch (error) {
                console.error("Parse error or DB error:", error);
                res.status(500).json({ error: "Failed to process recommendations" });
            }
        });
    } catch (error) {
        console.error("Critical recommendation error:", error);
        res.status(500).json({ error: "Server error" });
    }
};
