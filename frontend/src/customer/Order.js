import { API_BASE_URL } from "../config/api";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, ArrowLeft, Search, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

const Order = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [showTrackModal, setShowTrackModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showDeliveryReviewModal, setShowDeliveryReviewModal] = useState(false);
    const [reviewData, setReviewData] = useState({ productid: '', rating: 5, comment: '' });
    const [deliveryReviewData, setDeliveryReviewData] = useState({ rating: 5, comment: '' });
    const [reviewingProductName, setReviewingProductName] = useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            fetchOrders(parsedUser.id);
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const fetchOrders = async (userId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/grocery/orders/${userId}`);
            const data = await res.json();
            if (data.success) {
                setOrders(data.orders);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/grocery/product/review/add`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userid: user.id || user._id,
                    productid: reviewData.productid,
                    rating: reviewData.rating,
                    comment: reviewData.comment
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("Review submitted successfully!");
                setShowReviewModal(false);
                setReviewData({ productid: '', rating: 5, comment: '' });
                fetchOrders(user.id || user._id);
            } else {
                alert(data.message || "Failed to submit review");
            }
        } catch (error) {
            console.error("Error submitting review:", error);
            alert("Error submitting review");
        }
    };

    const handleSubmitDeliveryReview = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/grocery/delivery/rate`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: selectedOrder._id,
                    rating: deliveryReviewData.rating,
                    review: deliveryReviewData.comment
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("Delivery review submitted!");
                setShowDeliveryReviewModal(false);
                setDeliveryReviewData({ rating: 5, comment: '' });
                fetchOrders(user.id || user._id);
            } else {
                alert("Failed to submit review");
            }
        } catch (error) {
            console.error("Error rating delivery:", error);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            {/* Header */}
            <div className="bg-white sticky top-0 z-30 shadow-sm px-6 py-4 flex items-center gap-4">
                <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <h1 className="text-xl font-black uppercase tracking-tight">My Orders <span className="text-green-600">({orders.length})</span></h1>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-48 h-48 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                            <Package className="w-20 h-20 text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h3>
                        <p className="text-gray-500 mb-8 max-w-md">You currently have no past orders. Start shopping to fill your pantry!</p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-green-200 transition-all transform hover:scale-105"
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order, idx) => (
                            <motion.div
                                key={order._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
                            >
                                <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4 border-b border-gray-50 pb-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="font-black text-lg text-gray-900">Order #{order._id.slice(-6).toUpperCase()}</span>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest 
                                                ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'Paid' ? 'bg-blue-100 text-blue-700' :
                                                        order.status === 'Assigned' ? 'bg-indigo-100 text-indigo-700' :
                                                            order.status === 'Accepted' ? 'bg-amber-100 text-amber-700' :
                                                                order.status === 'Dispatched' ? 'bg-purple-100 text-purple-700' :
                                                                    order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                                                        'bg-gray-100 text-gray-700'}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="flex text-sm text-gray-500 gap-4">
                                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(order.date).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1"><Package className="w-4 h-4" /> {order.items.length} Items</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500 font-medium">Total Amount</p>
                                        <p className="text-2xl font-black text-gray-900">₹{order.totalAmount}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6">
                                    {order.items.map((item, i) => (
                                        <div key={i} className="flex gap-4 items-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                                                {item.productid?.productimage ? (
                                                    <img
                                                        src={`${API_BASE_URL}/product/${item.productid.productimage}`}
                                                        alt={item.productid.productname}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">N/A</div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900">{item.productid?.productname || 'Unknown Product'}</h4>
                                                <p className="text-xs text-gray-500">Qty: {item.quantity} x ₹{item.price}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className="font-bold text-gray-900">₹{item.quantity * item.price}</span>
                                                {order.status === 'Delivered' && (
                                                    item.productid?.reviews?.some(r => (r.userid?._id || r.userid) === (user?.id || user?._id)) ? (
                                                        <span className="text-[10px] font-black uppercase text-gray-400">Reviewed</span>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                setReviewData({ ...reviewData, productid: item.productid._id });
                                                                setReviewingProductName(item.productid.productname);
                                                                setShowReviewModal(true);
                                                            }}
                                                            className="text-[10px] font-black uppercase text-green-600 hover:text-green-700 transition-colors"
                                                        >
                                                            Rate & Review
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    {order.deliveryBoyId && (
                                        <div className="flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100">
                                            <Truck className="w-4 h-4 text-indigo-600" />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Delivery Agent</span>
                                                <span className="text-xs font-bold text-indigo-900">{order.deliveryBoyId.name} • {order.deliveryBoyId.phone}</span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex gap-3 ml-auto">
                                        {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                                            <button
                                                onClick={() => { setSelectedOrder(order); setShowTrackModal(true); }}
                                                className="px-6 py-2 rounded-xl text-white font-bold text-sm bg-green-600 hover:bg-green-700 transition-colors shadow-lg shadow-green-100"
                                            >
                                                Track Order
                                            </button>
                                        )}
                                        {order.status === 'Delivered' && !order.deliveryReview && (
                                            <button
                                                onClick={() => { setSelectedOrder(order); setShowDeliveryReviewModal(true); }}
                                                className="px-6 py-2 rounded-xl text-white font-bold text-sm bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                                            >
                                                Rate Delivery
                                            </button>
                                        )}
                                        {order.status === 'Delivered' && order.deliveryReview && (
                                            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl border border-amber-100">
                                                <span className="text-amber-600">★</span>
                                                <span className="text-xs font-black text-amber-900">{order.deliveryReview.rating}/5</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl"
                    >
                        <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">Rate Product</h3>
                        <p className="text-gray-500 font-bold text-sm mb-6">Share your experience with <span className="text-green-600">{reviewingProductName}</span></p>

                        <form onSubmit={handleSubmitReview} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setReviewData({ ...reviewData, rating: star })}
                                            className={`text-2xl ${reviewData.rating >= star ? 'text-yellow-400' : 'text-gray-200'}`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Comment</label>
                                <textarea
                                    value={reviewData.comment}
                                    onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 outline-none focus:border-green-500 focus:bg-white transition-all min-h-[100px] font-medium text-sm"
                                    placeholder="Write your review here..."
                                    required
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowReviewModal(false)}
                                    className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-green-700 transition-all shadow-xl shadow-green-100"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Delivery Review Modal */}
            {showDeliveryReviewModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl"
                    >
                        <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">Rate Delivery</h3>
                        <p className="text-gray-500 font-bold text-sm mb-6">How was your delivery experience with <span className="text-indigo-600">{selectedOrder?.deliveryBoyId?.name}</span>?</p>

                        <form onSubmit={handleSubmitDeliveryReview} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Service Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setDeliveryReviewData({ ...deliveryReviewData, rating: star })}
                                            className={`text-2xl ${deliveryReviewData.rating >= star ? 'text-yellow-400' : 'text-gray-200'}`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Feedback</label>
                                <textarea
                                    value={deliveryReviewData.comment}
                                    onChange={(e) => setDeliveryReviewData({ ...deliveryReviewData, comment: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 outline-none focus:border-indigo-500 focus:bg-white transition-all min-h-[100px] font-medium text-sm"
                                    placeholder="Write your delivery experience here..."
                                    required
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowDeliveryReviewModal(false)}
                                    className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                                >
                                    Submit Feedback
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Tracking Modal */}
            {showTrackModal && selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl relative overflow-hidden"
                    >
                        <div className="text-center mb-10">
                            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mx-auto mb-4">
                                <Truck className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Live Tracking</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Order #{selectedOrder._id.slice(-6).toUpperCase()}</p>
                        </div>

                        <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                            {[
                                { status: 'Paid', label: 'Payment Confirmed', icon: CheckCircle },
                                { status: 'Assigned', label: 'Agent Assigned', icon: Truck },
                                { status: 'Accepted', label: 'Agent Preparing', icon: Package },
                                { status: 'Dispatched', label: 'Out for Delivery', icon: Truck },
                                { status: 'Delivered', label: 'Delivered Successfully', icon: CheckCircle }
                            ].map((step, idx) => {
                                const statuses = ['Paid', 'Assigned', 'Accepted', 'Dispatched', 'Delivered'];
                                const currentIndex = statuses.indexOf(selectedOrder.status);
                                const stepIndex = statuses.indexOf(step.status);
                                const isActive = stepIndex <= currentIndex;

                                return (
                                    <div key={idx} className="flex items-center gap-6 relative z-10">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-colors ${isActive ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                            <step.icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-sm font-black uppercase tracking-wider ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                                            {selectedOrder.status === step.status && (
                                                <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-black rounded-md mt-1 italic animate-pulse">CURRENT STATUS</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => setShowTrackModal(false)}
                            className="w-full mt-10 bg-gray-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-green-600 transition-all active:scale-95 shadow-xl"
                        >
                            Close Tracker
                        </button>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Order;
