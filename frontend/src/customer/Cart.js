import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowLeft, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Cart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [orderSuccess, setOrderSuccess] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            fetchCart(parsedUser.id || parsedUser._id);
            fetchOffers();
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const fetchCart = async (userId) => {
        try {
            const res = await fetch(`http://localhost:5510/grocery/cart/get/${userId}`);
            const data = await res.json();
            if (data.success && data.cart) {
                setCartItems(data.cart.products);
            }
        } catch (error) {
            console.error("Error fetching cart:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOffers = async () => {
        try {
            const res = await fetch('http://localhost:5510/grocery/homepage/offers');
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setOffers(data.offers);
                }
            }
        } catch (error) {
            console.error("Error fetching offers:", error);
        }
    };

    const getDiscountedPrice = (product) => {
        if (!product || !product.price) return 0;

        const prodId = (product._id || product).toString();
        const subcatId = (product.subcategoryid?._id || product.subcategoryid)?.toString();
        const catId = (product.categoryid?._id || product.categoryid)?.toString();

        // Find applicable offer with strict precedence: Product > Subcategory > Category > Global
        const productOffer = offers.find(o => (o.productid?._id || o.productid)?.toString() === prodId);
        const subcatOffer = offers.find(o => (o.subcategoryid?._id || o.subcategoryid)?.toString() === subcatId);
        const catOffer = offers.find(o => (o.categoryid?._id || o.categoryid)?.toString() === catId);
        const globalOffer = offers.find(o => o.isGlobal);

        const applicableOffer = productOffer || subcatOffer || catOffer || globalOffer;

        if (applicableOffer && applicableOffer.discount) {
            const match = applicableOffer.discount.match(/(\d+)%/);
            if (match) {
                const percentage = parseInt(match[1]);
                const discountAmount = (product.price * (percentage / 100));
                return Math.round(product.price - discountAmount);
            }
        }
        return product.price;
    };

    const removeFromCart = async (productId) => {
        try {
            const res = await fetch('http://localhost:5510/grocery/cart/remove', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userid: user.id || user._id, productid: productId })
            });
            const data = await res.json();
            if (data.success) {
                fetchCart(user.id);
            }
        } catch (error) {
            console.error("Error removing item:", error);
        }
    };

    const updateQuantity = async (productId, newQuantity) => {
        try {
            const res = await fetch('http://localhost:5510/grocery/cart/updatequantity', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userid: user.id || user._id, productid: productId, quantity: newQuantity })
            });
            const data = await res.json();
            if (data.success) {
                // If quantity is 0 or less, it might be removed by backend, so we fetch fresh
                fetchCart(user.id);
            } else {
                alert(data.message || "Failed to update quantity");
            }
        } catch (error) {
            console.error("Error updating quantity:", error);
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            const price = getDiscountedPrice(item.productid);
            return total + price * item.quantity;
        }, 0);
    };

    const handleCheckout = () => {
        const total = calculateTotal();
        const items = cartItems.map(item => ({
            productid: item.productid._id,
            quantity: item.quantity,
            price: getDiscountedPrice(item.productid)
        }));

        navigate('/payment', {
            state: {
                orderData: {
                    userid: user.id || user._id,
                    totalAmount: total,
                    items: items,
                    type: 'cart_checkout'
                }
            }
        });
    };

    const handleBuyItem = (item) => {
        const price = getDiscountedPrice(item.productid);
        const total = (price * item.quantity);
        const items = [{
            productid: item.productid._id,
            quantity: item.quantity,
            price: price
        }];

        navigate('/payment', {
            state: {
                orderData: {
                    userid: user.id || user._id,
                    totalAmount: total,
                    items: items,
                    type: 'single_buy'
                }
            }
        });
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
    );

    if (orderSuccess) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 px-4 text-center">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-200"
            >
                <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">Order Placed Successfully!</h2>
            <p className="text-gray-500 mb-8">Your fresh groceries are on their way.</p>
            <button onClick={() => navigate('/')} className="text-green-600 font-bold hover:text-green-700 transition-colors">
                Continue Shopping
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            {/* Header */}
            <div className="bg-white sticky top-0 z-30 shadow-sm px-6 py-4 flex items-center gap-4">
                <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <h1 className="text-xl font-black uppercase tracking-tight">My Cart <span className="text-green-600">({cartItems.length})</span></h1>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-3xl">
                {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-48 h-48 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                            <ShoppingBag className="w-20 h-20 text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h3>
                        <p className="text-gray-500 mb-8 max-w-md">Looks like you haven't added anything to your cart yet. Go ahead and explore our fresh categories.</p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-green-200 transition-all transform hover:scale-105"
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <AnimatePresence>
                            {cartItems.map((item) => (
                                <motion.div
                                    key={item._id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex gap-4 items-center group"
                                >
                                    <div className="w-24 h-24 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0">
                                        <img
                                            src={`http://localhost:5510/product/${item.productid?.productimage}`}
                                            alt={item.productid?.productname}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-lg text-gray-900 truncate pr-4">{item.productid?.productname}</h3>
                                        </div>
                                        <p className="text-xs text-green-600 font-bold uppercase tracking-widest mb-3">{item.productid?.shopid?.shopName || 'Shop'}</p>
                                        <div className="flex justify-between items-end">
                                            <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1">
                                                <button
                                                    onClick={() => updateQuantity(item.productid?._id, item.quantity - 1)}
                                                    className="w-6 h-6 flex items-center justify-center bg-white rounded-lg shadow-sm font-bold text-gray-500 hover:text-black transition-colors disabled:opacity-50"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    -
                                                </button>
                                                <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.productid?._id, item.quantity + 1)}
                                                    className="w-6 h-6 flex items-center justify-center bg-white rounded-lg shadow-sm font-bold text-gray-500 hover:text-black transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="text-right">
                                                    {getDiscountedPrice(item.productid) < item.productid?.price && (
                                                        <div className="flex items-center gap-2 justify-end">
                                                            <span className="text-xs text-gray-400 line-through">₹{item.productid.price * item.quantity}</span>
                                                            <span className="text-[10px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded-md uppercase">SALE</span>
                                                        </div>
                                                    )}
                                                    <div className="text-xl font-black text-gray-900">
                                                        ₹{getDiscountedPrice(item.productid) * item.quantity}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleBuyItem(item)} // Create this function
                                                        className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-all"
                                                    >
                                                        Buy Now
                                                    </button>
                                                    <button
                                                        onClick={() => removeFromCart(item.productid?._id)}
                                                        className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Bill Details */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mt-8">
                            <h3 className="text-lg font-black uppercase tracking-tight mb-6">Bill Details</h3>
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-500 font-medium">
                                    <span>Item Total</span>
                                    <span>₹{calculateTotal()}</span>
                                </div>
                                <div className="flex justify-between text-gray-500 font-medium">
                                    <span>Delivery Fee</span>
                                    <span className="text-green-600">Free</span>
                                </div>
                                <div className="h-px bg-gray-100 my-2"></div>
                                <div className="flex justify-between text-xl font-black text-gray-900">
                                    <span>To Pay</span>
                                    <span>₹{calculateTotal()}</span>
                                </div>
                            </div>
                            <button
                                onClick={handleCheckout}
                                className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg hover:bg-gray-900 transition-all shadow-xl flex justify-between px-8"
                            >
                                <span>Place Order</span>
                                <span>₹{calculateTotal()}</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;