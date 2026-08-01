import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Package,
    Settings,
    LogOut,
    Plus,
    Star,
    MessageSquare,
    Sprout
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const FarmerDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'overview');
    const [user, setUser] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState([]);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.role !== 'farmer') {
                navigate('/login');
            }
            setUser(parsedUser);
            setSettings({
                name: parsedUser.profile?.name || '',
                farmName: parsedUser.profile?.farmName || '',
                phone: parsedUser.profile?.phone || '',
                address: parsedUser.profile?.address || ''
            });
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const [settings, setSettings] = useState({ name: '', farmName: '', phone: '', address: '' });

    const handleSettingsChange = (e) => {
        const { name, value } = e.target;
        setSettings({ ...settings, [name]: value });
    };

    const saveSettings = async () => {
        try {
            const response = await fetch('http://localhost:5510/grocery/farmer/updateprofile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    farmerid: user.profile._id,
                    ...settings,
                    email: user.email
                })
            });
            const data = await response.json();
            if (data.success) {
                setUser(data.user);
                localStorage.setItem('user', JSON.stringify(data.user));
                alert('Profile updated successfully!');
            }
        } catch (error) {
            console.error("Error updating settings:", error);
            alert('Failed to update profile');
        }
    };

    // Fetch Products & Calculate Stats
    useEffect(() => {
        const fetchData = async () => {
            if (user?.profile?._id) {
                setLoading(true);
                try {
                    const prodRes = await fetch(`http://localhost:5510/grocery/farmer/products/${user.profile._id}`);
                    const prodData = await prodRes.json();
                    if (prodData.success) {
                        setProducts(prodData.products);

                        // Calculate stats
                        const totalProducts = prodData.products.length;
                        const totalReviews = prodData.products.reduce((sum, p) => sum + (p.reviews?.length || 0), 0);
                        const avgRating = prodData.products.length > 0
                            ? (prodData.products.reduce((sum, p) => sum + (p.averageRating || 0), 0) / prodData.products.length).toFixed(1)
                            : '0.0';

                        setStats([
                            { label: 'Harvested Products', value: totalProducts.toString(), icon: Sprout, color: 'text-emerald-600', bg: 'bg-emerald-100', trend: '+2 this week' },
                            { label: 'Total Reviews', value: totalReviews.toString(), icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-100', trend: 'Growing' },
                            { label: 'Avg. Rating', value: avgRating, icon: Star, color: 'text-orange-600', bg: 'bg-orange-100', trend: 'Excellent' },
                            { label: 'Stock Status', value: prodData.products.filter(p => p.stockStatus === 'Available').length.toString(), icon: Package, color: 'text-purple-600', bg: 'bg-purple-100', trend: 'Active' },
                        ]);
                    }
                } catch (error) {
                    console.error("Error fetching farmer data:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchData();
    }, [user?.profile?._id, activeTab]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-gray-200 hidden lg:flex flex-col">
                <div className="p-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                        <Sprout className="text-white w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Farm<span className="text-emerald-600">Fresh</span></span>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
                    {[
                        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                        { id: 'addproduct', label: 'Add Harvest', icon: Plus },
                        { id: 'products', label: 'My Produce', icon: Package },
                        { id: 'reviews', label: 'Customer Feedback', icon: Star },
                        { id: 'settings', label: 'Farm Profile', icon: Settings },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (item.id === 'addproduct') navigate('/farmer/addproduct');
                                else setActiveTab(item.id);
                            }}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold transition-all ${activeTab === item.id
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100'
                                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 md:p-10 relative">
                {/* Topbar */}
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">
                            {activeTab === 'overview' ? 'Farmer Dashboard' : activeTab.replace('-', ' ')}
                        </h1>
                        <p className="text-gray-500 font-medium">Hello, {user?.profile?.name} • {user?.profile?.farmName}</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-100 rounded-2xl shadow-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-bold text-gray-600">Farm Verified</span>
                        </div>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            key="overview"
                            className="space-y-10"
                        >
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {stats.map((stat, idx) => (
                                    <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl transition-transform group-hover:scale-110`}>
                                                <stat.icon className="w-6 h-6" />
                                            </div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                                                {stat.trend}
                                            </div>
                                        </div>
                                        <div className="relative z-10">
                                            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">{stat.label}</p>
                                            <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                {/* Recent Performance */}
                                <div className="bg-emerald-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-emerald-900/40 relative overflow-hidden group">
                                    <div className="relative z-10 h-full flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-4xl font-black tracking-tight mb-4 lowercase">Harvest Goal</h3>
                                            <p className="text-emerald-200 text-lg font-medium opacity-80 leading-relaxed">Boost your production by 15% this season to unlock the 'Elite Producer' badge and featured placement!</p>
                                        </div>
                                        <div className="mt-12">
                                            <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-4">
                                                <span>Progress to Milestone</span>
                                                <span className="text-emerald-400">82%</span>
                                            </div>
                                            <div className="h-4 bg-white/10 rounded-full overflow-hidden border border-white/5 p-1">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: '82%' }}
                                                    className="h-full bg-gradient-to-r from-emerald-400 to-white rounded-full"
                                                ></motion.div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-emerald-500/10 rounded-full group-hover:scale-110 transition-transform"></div>
                                </div>

                                {/* Quick Actions */}
                                <div className="grid grid-cols-2 gap-6">
                                    <button onClick={() => navigate('/farmer/addproduct')} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-4 hover:shadow-xl hover:border-emerald-200 transition-all group">
                                        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                            <Plus className="w-7 h-7" />
                                        </div>
                                        <span className="font-black text-sm uppercase tracking-widest text-gray-900">Add Harvest</span>
                                    </button>
                                    <button onClick={() => setActiveTab('reviews')} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-4 hover:shadow-xl hover:border-blue-200 transition-all group">
                                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                            <Star className="w-7 h-7" />
                                        </div>
                                        <span className="font-black text-sm uppercase tracking-widest text-gray-900">View Reviews</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'products' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            key="products"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter">My Harvest Inventory</h3>
                                    <p className="text-gray-500 font-medium">Manage the products you've added to the market.</p>
                                </div>
                                <button
                                    onClick={() => navigate('/farmer/addproduct')}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-emerald-200 transition-all transform hover:scale-105 flex items-center gap-2"
                                >
                                    <Plus className="w-5 h-5" /> Add New Harvest
                                </button>
                            </div>

                            {loading ? <p className="text-center">Loading harvest...</p> : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                    {products.length === 0 ? (
                                        <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                                            <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                            <p className="text-gray-400 font-bold italic uppercase tracking-widest text-xs">No products harvested yet.</p>
                                        </div>
                                    ) : products.map((product) => (
                                        <div key={product._id} className="bg-white rounded-[2.5rem] p-6 border border-gray-50 shadow-sm hover:shadow-2xl transition-all group relative">
                                            <div className="aspect-square bg-gray-50 rounded-[2rem] mb-6 overflow-hidden flex items-center justify-center relative">
                                                <img
                                                    src={`http://localhost:5510/product/${product.productimage}`}
                                                    alt={product.productname}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-600 shadow-sm">
                                                    ₹{product.price}
                                                </div>
                                            </div>
                                            <div className="px-2">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-black uppercase tracking-tighter text-gray-900 text-lg leading-tight first-letter:text-emerald-600">{product.productname}</h4>
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-3.5 h-3.5 text-orange-400 fill-current" />
                                                        <span className="text-xs font-black text-gray-900">{product.averageRating || '0.0'}</span>
                                                    </div>
                                                </div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">{product.categoryname}</p>

                                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Stock</span>
                                                        <span className="text-sm font-black text-gray-900">{product.stockQuantity} kg</span>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const newStatus = product.stockStatus === 'Available' ? 'Out of Stock' : 'Available';
                                                            const updateStatus = async () => {
                                                                try {
                                                                    const res = await fetch(`http://localhost:5510/grocery/updateproductstatus/${product._id}`, {
                                                                        method: 'PUT',
                                                                        headers: { 'Content-Type': 'application/json' },
                                                                        body: JSON.stringify({ stockStatus: newStatus })
                                                                    });
                                                                    const data = await res.json();
                                                                    if (data.success) {
                                                                        setProducts(products.map(p => p._id === product._id ? { ...p, stockStatus: newStatus } : p));
                                                                    }
                                                                } catch (error) {
                                                                    console.error("Error updating status", error);
                                                                }
                                                            };
                                                            updateStatus();
                                                        }}
                                                        className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border transition-all ${product.stockStatus === 'Available' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-500 border-red-100'}`}
                                                    >
                                                        {product.stockStatus}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'reviews' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            key="reviews"
                        >
                            <h3 className="text-2xl font-black uppercase tracking-tighter mb-10">Customer Reviews</h3>
                            <div className="grid grid-cols-1 gap-6">
                                {products.some(p => p.reviews?.length > 0) ? (
                                    products.map(product =>
                                        product.reviews?.map((review, rIdx) => (
                                            <div key={`${product._id}-${rIdx}`} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-lg transition-all flex flex-col md:flex-row gap-8 items-start">
                                                <div className="w-full md:w-1/4">
                                                    <div className="flex items-center gap-4 mb-4">
                                                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 font-black text-xl">
                                                            {review.userid?.regid?.name?.[0]?.toUpperCase() || 'U'}
                                                        </div>
                                                        <div>
                                                            <h5 className="font-bold text-gray-900">{review.userid?.regid?.name || 'Customer'}</h5>
                                                            <p className="text-[10px] font-bold text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1 mb-2">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-orange-400 fill-current' : 'text-gray-200'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex-1 bg-gray-50/50 p-6 rounded-2xl border border-gray-100 italic font-medium text-gray-600 quote">
                                                    <p className="mb-4">"{review.comment}"</p>
                                                    <div className="flex items-center gap-2 pt-4 border-t border-gray-200/50 not-italic">
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">About Product:</span>
                                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md">{product.productname}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )
                                ) : (
                                    <div className="py-40 text-center bg-white rounded-[4rem] border border-dashed border-gray-200">
                                        <MessageSquare className="w-16 h-16 text-gray-100 mx-auto mb-6" />
                                        <h3 className="text-2xl font-black text-gray-300 tracking-tighter uppercase">No Feedback Yet</h3>
                                        <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] mt-2">When customers rate your products, they will appear here.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'settings' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            key="settings"
                            className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-12 max-w-3xl"
                        >
                            <h3 className="text-2xl font-black uppercase tracking-tighter mb-10">Farm Profile Settings</h3>
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Farmer Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={settings.name}
                                            onChange={handleSettingsChange}
                                            className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-gray-900"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Farm Name</label>
                                        <input
                                            type="text"
                                            name="farmName"
                                            value={settings.farmName}
                                            onChange={handleSettingsChange}
                                            className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-gray-900"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={settings.phone}
                                        onChange={handleSettingsChange}
                                        className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-gray-900"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Farm Address</label>
                                    <textarea
                                        name="address"
                                        value={settings.address}
                                        onChange={handleSettingsChange}
                                        rows="3"
                                        className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-gray-900 resize-none"
                                    />
                                </div>
                                <button
                                    onClick={saveSettings}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-emerald-100 transition-all transform hover:scale-105 active:scale-95 w-full md:w-auto"
                                >
                                    Update Profile
                                </button>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </main>
        </div>
    );
};

export default FarmerDashboard;
