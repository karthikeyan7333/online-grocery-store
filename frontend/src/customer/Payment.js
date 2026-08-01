import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from "axios";

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderData } = location.state || {}; // Expecting { items, totalAmount, type, userid }
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!orderData) {
            navigate('/cart');
        }
    }, [orderData, navigate]);

    const handlePayment = async () => {
        setLoading(true);
        setError(null);

        try {
            // 1. Get Key ID (Optional, or just use hardcoded if env not exposed, but secure way is endpoint)
            const { data: { key } } = await axios.get("http://localhost:5510/api/payment/get-key");

            // 2. Create Order
            const { data: { data: order } } = await axios.post("http://localhost:5510/api/payment/orders", {
                amount: orderData.totalAmount
            });

            // 3. Initialize Razorpay options
            // Get user from local storage for prefill
            const storedUser = localStorage.getItem('user');
            const user = storedUser ? JSON.parse(storedUser) : {};
            const userProfile = user.profile || {};

            const options = {
                key: key,
                amount: order.amount,
                currency: order.currency,
                name: "Online Grocery",
                description: "Grocery Order Payment",
                order_id: order.id,
                handler: async (response) => {
                    try {
                        // 4. Verify Payment
                        const verifyUrl = "http://localhost:5510/api/payment/verify";
                        const { data: verifyData } = await axios.post(verifyUrl, response);

                        if (verifyData.message === "Payment verified successfully") {
                            // 5. Place Order in Backend
                            await placeOrderOnBackend(response);
                        } else {
                            setError("Payment verification failed.");
                            setLoading(false);
                        }
                    } catch (err) {
                        console.error("Verification Error:", err);
                        setError("Payment verification failed via backend.");
                        setLoading(false);
                    }
                },
                prefill: {
                    name: userProfile.name || "Customer",
                    email: user.email || "customer@example.com",
                    contact: userProfile.phone || "9999999999"
                },
                theme: {
                    color: "#2416a3ff"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                setError("Payment Failed: " + response.error.description);
                setLoading(false);
            });
            rzp.open();

        } catch (err) {
            console.error("Payment Init Error:", err);
            setError("Failed to initialize payment. Check server connection.");
            setLoading(false);
        }
    };

    const placeOrderOnBackend = async (paymentDetails) => {
        try {
            const res = await axios.post('http://localhost:5510/grocery/order/place', {
                userid: orderData.userid,
                totalAmount: orderData.totalAmount,
                items: orderData.items,
                type: orderData.type,
                paymentDetails: paymentDetails
            });

            if (res.data.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/order');
                }, 3000);
            } else {
                setError(res.data.message || "Failed to place order in system backend.");
                setLoading(false);
            }
        } catch (err) {
            console.error("Place Order Error:", err);
            setError("Payment successful but failed to record order. Contact support.");
            setLoading(false);
        }
    };

    if (!orderData) return null;

    if (success) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 px-4 text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-200"
                >
                    <CheckCircle className="w-12 h-12 text-white" />
                </motion.div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">Payment Successful!</h2>
                <p className="text-gray-500 mb-8">Order has been placed successfully.</p>
                <button onClick={() => navigate('/order')} className="text-green-600 font-bold hover:underline">
                    View Orders
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header */}
            <div className="bg-white sticky top-0 z-30 shadow-sm px-6 py-4 flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <h1 className="text-xl font-black uppercase tracking-tight">Checkout</h1>
            </div>

            <div className="flex-1 flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-gray-100 p-8">
                    <div className="text-center mb-8">
                        <p className="text-gray-500 font-medium mb-1">Total Amount to Pay</p>
                        <h2 className="text-4xl font-black text-gray-900">₹{orderData.totalAmount}</h2>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 mb-6">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <button
                        onClick={handlePayment}
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-bold shadow-xl shadow-green-200 transition-all transform hover:scale-105 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <CreditCard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                Pay with Razorpay
                            </>
                        )}
                    </button>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-center text-gray-400 mb-2 font-bold">DEVELOPER MODE</p>
                        <button
                            onClick={() => {
                                const dummyPayment = {
                                    razorpay_payment_id: "pay_dummy_" + Date.now(),
                                    razorpay_order_id: "order_dummy_" + Date.now(),
                                    razorpay_signature: "dummy_signature_bypass"
                                };
                                placeOrderOnBackend(dummyPayment);
                            }}
                            className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-3xl text-sm transition-colors"
                        >
                            Simulate Payment Success (Bypass Gateway)
                        </button>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-center text-gray-400">
                            Secure payment powered by Razorpay.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;