import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Star, ChevronRight } from 'lucide-react';

const RecommendationModal = ({ isOpen, onClose, productName, addedProduct, handleAddToCart }) => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && productName) {
            fetchRecommendations();
        }
    }, [isOpen, productName]);

    const fetchRecommendations = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5510/grocery/recommend/${encodeURIComponent(productName)}`);
            const data = await res.json();
            if (data.success) {
                // Filter out the product that was just added
                setRecommendations(data.products.filter(p => p.productname !== productName));
            }
        } catch (error) {
            console.error("Error fetching recommendations:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl relative border border-gray-100"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 z-10 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-all"
                    >
                        <X className="w-5 h-5 text-gray-900" />
                    </button>

                    <div className="p-8 md:p-12">
                        {/* Success Message */}
                        <div className="flex items-center gap-4 mb-8 bg-green-50 p-6 rounded-3xl border border-green-100">
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-200">
                                <ShoppingCart className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Added to Cart!</h2>
                                <p className="text-sm text-green-700 font-bold">{productName} has been added successfully.</p>
                            </div>
                        </div>

                        {/* Recommendations Section */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">You might also like</h3>
                                {loading && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent"></div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {recommendations.length === 0 && !loading ? (
                                    <p className="col-span-2 text-center text-gray-400 font-medium italic py-8">No specific recommendations found.</p>
                                ) : (
                                    recommendations.map((product) => (
                                        <motion.div
                                            key={product._id}
                                            whileHover={{ y: -5 }}
                                            className="group bg-gray-50 rounded-3xl p-4 border border-gray-100 hover:bg-white hover:shadow-xl transition-all cursor-pointer flex gap-4"
                                            onClick={() => {
                                                handleAddToCart(product._id);
                                                // Option to keep modal open or close? Let's close for now or show another success
                                            }}
                                        >
                                            <div className="w-20 h-20 bg-white rounded-2xl overflow-hidden flex-shrink-0 shadow-sm">
                                                <img
                                                    src={`http://localhost:5510/product/${product.productimage}`}
                                                    alt={product.productname}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                            <div className="flex flex-col justify-center overflow-hidden">
                                                <h4 className="font-bold text-sm text-gray-900 uppercase tracking-tight line-clamp-1 group-hover:text-green-600 transition-colors">{product.productname}</h4>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="flex items-center text-yellow-500">
                                                        <Star className="w-3 h-3 fill-current" />
                                                        <span className="text-[10px] ml-0.5 font-bold">{product.averageRating || '0.0'}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between mt-1">
                                                    <p className="font-black text-gray-900">₹{product.price}</p>
                                                    <button className="bg-green-600 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                                        <ShoppingCart className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full mt-10 py-4 bg-gray-950 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-green-600 transition-all transform active:scale-95 shadow-xl"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default RecommendationModal;
