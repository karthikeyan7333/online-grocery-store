import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Settings,
    LogOut,
    Plus,
    Search,
    MoreVertical,
    TrendingUp,
    Users,
    ArrowUpRight,
    ArrowDownRight,
    Bell,
    CheckCircle,
    Clock,
    X,
    Folder,
    Store,
    Tag,
    Truck,
    Sprout,
    ClipboardList
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'overview');
    const [user, setUser] = useState(null);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubCategories] = useState([]);
    const [shops, setShops] = useState([]);
    const [products, setProducts] = useState([]);
    const [offers, setOffers] = useState([]);
    const [deliveryBoys, setDeliveryBoys] = useState([]);
    const [farmers, setFarmers] = useState([]);

    const [orders, setOrders] = useState([]);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [leaveRequests, setLeaveRequests] = useState([]); // Leave Requests

    // Notifications State
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.role !== 'admin') {
                navigate('/login');
            }
            setUser(parsedUser);
        } else {
            navigate('/login');
        }
    }, [navigate]);

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Categories
            const catRes = await fetch(`http://localhost:5510/grocery/categories/getall`);
            const catData = await catRes.json();
            if (catData.success) setCategories(catData.categories);

            // Fetch SubCategories
            const subRes = await fetch(`http://localhost:5510/grocery/subcategories/getall`);
            const subData = await subRes.json();
            if (subData.success) setSubCategories(subData.subcategories);

            // Fetch Shops
            const shopRes = await fetch(`http://localhost:5510/grocery/shops/getall`);
            const shopData = await shopRes.json();
            if (shopData.success) setShops(shopData.shops);

            // Fetch Products
            const prodRes = await fetch(`http://localhost:5510/grocery/products/getall`);
            const prodData = await prodRes.json();
            if (prodData.success) setProducts(prodData.products);

            // Fetch Offers
            const offerRes = await fetch(`http://localhost:5510/grocery/offer/getall`);
            const offerData = await offerRes.json();
            if (offerData.success) setOffers(offerData.offers);

            // Fetch Delivery Boys
            const deliveryRes = await fetch(`http://localhost:5510/grocery/admin/getdeliveryboys`);
            const deliveryData = await deliveryRes.json();
            if (deliveryRes.ok && deliveryData.success) setDeliveryBoys(deliveryData.deliveryBoys);

            // Fetch Farmers
            const farmerRes = await fetch(`http://localhost:5510/grocery/admin/getfarmers`);
            const farmerData = await farmerRes.json();
            if (farmerRes.ok && farmerData.success) setFarmers(farmerData.farmers);

            // Fetch All Orders
            const orderRes = await fetch(`http://localhost:5510/grocery/admin/orders/getall`);
            const orderData = await orderRes.json();
            if (orderData.success) setOrders(orderData.orders);

            // Fetch Leave Requests
            const leaveRes = await fetch(`http://localhost:5510/grocery/admin/leaves`);
            const leaveData = await leaveRes.json();
            if (leaveData.success) setLeaveRequests(leaveData.leaves);

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        fetchNotifications();
    }, [activeTab]);

    const fetchNotifications = async () => {
        try {
            const res = await fetch(`http://localhost:5510/grocery/notifications/get?role=admin`);
            const data = await res.json();
            if (data.success) {
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const handleMarkAsRead = async () => {
        try {
            await fetch('http://localhost:5510/grocery/notifications/read', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: 'all', role: 'admin' })
            });
            setUnreadCount(0);
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error(error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    const handleUpdateShopStatus = async (shopid, status) => {
        try {
            const res = await fetch(`http://localhost:5510/grocery/admin/updateshopstatus`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shopid, status })
            });
            const data = await res.json();
            if (data.success) {
                setShops(shops.map(shop => shop._id === shopid ? { ...shop, status } : shop));
            } else {
                alert(data.message || "Failed to update status");
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const handleUpdateDeliveryStatus = async (deliveryid, status) => {
        try {
            const res = await fetch(`http://localhost:5510/grocery/admin/updatedeliverystatus`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deliveryid, status })
            });
            const data = await res.json();
            if (data.success) {
                setDeliveryBoys(deliveryBoys.map(boy => boy._id === deliveryid ? { ...boy, status } : boy));
            } else {
                alert(data.message || "Failed to update status");
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const handleUpdateFarmerStatus = async (farmerid, status) => {
        try {
            const res = await fetch(`http://localhost:5510/grocery/admin/updatefarmerstatus`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ farmerid, status })
            });
            const data = await res.json();
            if (data.success) {
                setFarmers(farmers.map(farmer => farmer._id === farmerid ? { ...farmer, status } : farmer));
            } else {
                alert(data.message || "Failed to update status");
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const handleAssignDelivery = async (deliveryBoyId) => {
        try {
            const res = await fetch(`http://localhost:5510/grocery/delivery/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: selectedOrder._id, deliveryBoyId })
            });
            const data = await res.json();
            if (data.success) {
                alert("Delivery assigned successfully!");
                setShowAssignModal(false);
                fetchData(); // Refresh orders
            } else {
                alert(data.message || "Failed to assign delivery");
            }
        } catch (error) {
            console.error("Assignment error:", error);
        }
    };

    const stats = [
        { label: 'Total Shops', value: shops.length.toString(), change: '+12.5%', icon: Store, color: 'text-green-600', bg: 'bg-green-100' },
        { label: 'Farmers', value: farmers.length.toString(), change: '+3', icon: Sprout, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        { label: 'Categories', value: categories.length.toString(), change: '+5', icon: Folder, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Delivery Boys', value: deliveryBoys.length.toString(), change: '+2', icon: Truck, color: 'text-purple-600', bg: 'bg-purple-100' },
        { label: 'Total Products', value: products.length.toString(), change: '+20%', icon: Package, color: 'text-orange-600', bg: 'bg-orange-100' },
    ];

    const handleUpdateLeaveStatus = async (leaveId, status) => {
        if (!window.confirm(`Are you sure you want to ${status} this request?`)) return;
        try {
            const res = await fetch('http://localhost:5510/grocery/admin/leave/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leaveId, status })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                fetchData();
            }
        } catch (error) {
            console.error("Error updating leave:", error);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-gray-200 hidden lg:flex flex-col">
                <div className="p-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                        <LayoutDashboard className="text-white w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Grocy<span className="text-black">Admin</span></span>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
                    {[
                        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
                        { id: 'addcategory', label: 'Add Category', icon: Plus },
                        { id: 'addsubcategory', label: 'Add Sub Category', icon: Plus },
                        { id: 'categories', label: 'Categories', icon: Folder },
                        { id: 'subcategories', label: 'Sub Categories', icon: Folder },
                        { id: 'shops', label: 'Shops', icon: Store },
                        { id: 'farmers', label: 'Farmers', icon: Sprout },
                        { id: 'deliveries', label: 'Delivery Boys', icon: Truck },
                        { id: 'leaves', label: 'Leave Requests', icon: ClipboardList },
                        { id: 'orders', label: 'Orders', icon: ShoppingCart },
                        { id: 'products', label: 'Products', icon: Package },
                        { id: 'offers', label: 'Offers', icon: Tag },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (item.id === 'addcategory') navigate('/admin/addcategory');
                                else if (item.id === 'addsubcategory') navigate('/admin/addsubcategory');
                                else setActiveTab(item.id);
                            }}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold transition-all ${activeTab === item.id
                                ? 'bg-black text-white shadow-lg shadow-gray-200'
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
                            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                        </h1>
                        <p className="text-gray-500 font-medium">Administrator Panel</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-11 pr-6 py-3 bg-white border border-gray-200 rounded-2xl w-64 focus:border-black outline-none transition-all shadow-sm"
                            />
                        </div>
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowNotifications(!showNotifications);
                                    if (!showNotifications && unreadCount > 0) handleMarkAsRead();
                                }}
                                className="relative p-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all shadow-sm z-50"
                            >
                                <Bell className="w-5 h-5 text-gray-600" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            <AnimatePresence>
                                {showNotifications && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setShowNotifications(false)}
                                        ></div>
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
                                        >
                                            <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                                                <h4 className="font-bold text-gray-900">Notifications</h4>
                                                <button onClick={handleMarkAsRead} className="text-xs font-bold text-green-600 hover:text-green-700">Mark all read</button>
                                            </div>
                                            <div className="max-h-80 overflow-y-auto">
                                                {notifications.length === 0 ? (
                                                    <div className="p-8 text-center text-gray-400 text-sm">No notifications</div>
                                                ) : (
                                                    notifications.map((notif) => (
                                                        <div key={notif._id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-green-50/50' : ''}`}>
                                                            <div className="flex gap-3">
                                                                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notif.type === 'alert' || notif.type === 'warning' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                                                <div>
                                                                    <p className="text-sm text-gray-800 font-medium mb-1">{notif.message}</p>
                                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(notif.createdAt).toLocaleString()}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {stats.map((stat, idx) => (
                                    <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl transition-transform group-hover:scale-110`}>
                                                <stat.icon className="w-6 h-6" />
                                            </div>
                                            <div className={`flex items-center gap-1 text-sm font-bold ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>
                                                {stat.change}
                                            </div>
                                        </div>
                                        <div className="relative z-10">
                                            <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mb-1">{stat.label}</p>
                                            <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'categories' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            key="categories"
                            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter">Categories</h3>
                                    <p className="text-gray-500 font-medium">All Available Categories</p>
                                </div>
                                <button
                                    onClick={() => navigate('/admin/addcategory')}
                                    className="bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-gray-200 transition-all transform hover:scale-105 flex items-center gap-2"
                                >
                                    <Plus className="w-5 h-5" /> Add New Category
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {categories.map((cat) => (
                                    <div key={cat._id} className="group border border-gray-100 rounded-[2rem] p-4 hover:shadow-xl transition-all relative">
                                        <div className="aspect-video bg-gray-50 rounded-[1.5rem] mb-4 overflow-hidden flex items-center justify-center relative">
                                            <img
                                                src={`http://localhost:5510/category/${cat.categoryimage}`}
                                                alt={cat.categoryname}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="px-2">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="text-lg font-black uppercase tracking-tighter text-gray-900 line-clamp-1">{cat.categoryname}</h4>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate('/admin/editcategory', { state: { category: cat } });
                                                        }}
                                                        className="p-2 bg-gray-100 rounded-lg hover:bg-black hover:text-white transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Settings className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            if (window.confirm("Are you sure you want to delete this category?")) {
                                                                try {
                                                                    const res = await fetch(`http://localhost:5510/grocery/category/delete/${cat._id}`, { method: 'DELETE' });
                                                                    const data = await res.json();
                                                                    if (data.success) {
                                                                        setCategories(categories.filter(c => c._id !== cat._id));
                                                                    } else {
                                                                        alert(data.message);
                                                                    }
                                                                } catch (err) {
                                                                    console.error(err);
                                                                    alert("Error deleting category");
                                                                }
                                                            }
                                                        }}
                                                        className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                                        title="Delete"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 line-clamp-2">{cat.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'subcategories' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            key="subcategories"
                            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter">Sub Categories</h3>
                                    <p className="text-gray-500 font-medium">All Available Sub Categories</p>
                                </div>
                                <button
                                    onClick={() => navigate('/admin/addsubcategory')}
                                    className="bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-gray-200 transition-all transform hover:scale-105 flex items-center gap-2"
                                >
                                    <Plus className="w-5 h-5" /> Add Sub Category
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {subcategories.map((sub) => (
                                    <div key={sub._id} className="group border border-gray-100 rounded-[2rem] p-4 hover:shadow-xl transition-all relative">
                                        <div className="aspect-video bg-gray-50 rounded-[1.5rem] mb-4 overflow-hidden flex items-center justify-center relative">
                                            {sub.subcategoryimage ? (
                                                <img
                                                    src={`http://localhost:5510/subcategory/${sub.subcategoryimage}`}
                                                    alt={sub.subcategoryname}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center text-4xl">📦</div>
                                            )}
                                        </div>
                                        <div className="px-2">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="text-lg font-black uppercase tracking-tighter text-gray-900 line-clamp-1">{sub.subcategoryname}</h4>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate('/admin/editsubcategory', { state: { subcategory: sub } });
                                                        }}
                                                        className="p-2 bg-gray-100 rounded-lg hover:bg-black hover:text-white transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Settings className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            if (window.confirm("Are you sure you want to delete this subcategory?")) {
                                                                try {
                                                                    const res = await fetch(`http://localhost:5510/grocery/subcategory/delete/${sub._id}`, { method: 'DELETE' });
                                                                    const data = await res.json();
                                                                    if (data.success) {
                                                                        setSubCategories(subcategories.filter(s => s._id !== sub._id));
                                                                    } else {
                                                                        alert(data.message);
                                                                    }
                                                                } catch (err) {
                                                                    console.error(err);
                                                                    alert("Error deleting subcategory");
                                                                }
                                                            }
                                                        }}
                                                        className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                                        title="Delete"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-xs text-green-600 font-bold uppercase tracking-widest">{sub.categoryid?.categoryname || 'Unknown Category'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'shops' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            key="shops"
                            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8"
                        >
                            <h3 className="text-2xl font-black uppercase tracking-tighter mb-8">Registered Shops</h3>
                            <div className="grid grid-cols-1 gap-6">
                                {shops.map((shop) => (
                                    <div key={shop._id} className="flex justify-between items-center p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h4 className="font-bold text-lg">{shop.shopName}</h4>
                                                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide ${shop.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                    shop.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {shop.status || 'Pending'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">Owner: <span className="text-gray-900 font-medium">{shop.ownerName}</span></p>
                                            <p className="text-sm text-gray-500">Phone: <span className="text-gray-900 font-medium">{shop.phone}</span></p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {shop.status !== 'Approved' && (
                                                <button
                                                    onClick={() => handleUpdateShopStatus(shop._id, 'Approved')}
                                                    className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            {shop.status !== 'Rejected' && (
                                                <button
                                                    onClick={() => handleUpdateShopStatus(shop._id, 'Rejected')}
                                                    className="px-6 py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold hover:bg-red-100 transition-all"
                                                >
                                                    Reject
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'farmers' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            key="farmers"
                            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8"
                        >
                            <h3 className="text-2xl font-black uppercase tracking-tighter mb-8">Registered Farmers</h3>
                            <div className="grid grid-cols-1 gap-6">
                                {farmers.map((farmer) => (
                                    <div key={farmer._id} className="flex justify-between items-center p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h4 className="font-bold text-lg">{farmer.name}</h4>
                                                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide ${farmer.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                    farmer.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {farmer.status || 'Pending'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">Farm: <span className="text-gray-900 font-medium">{farmer.farmName}</span></p>
                                            <p className="text-sm text-gray-500">Phone: <span className="text-gray-900 font-medium">{farmer.phone}</span></p>
                                            <p className="text-sm text-gray-500 font-bold uppercase tracking-tighter text-[10px]">Address: <span className="text-gray-400 font-medium">{farmer.address}</span></p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {farmer.status !== 'Approved' && (
                                                <button
                                                    onClick={() => handleUpdateFarmerStatus(farmer._id, 'Approved')}
                                                    className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            {farmer.status !== 'Rejected' && (
                                                <button
                                                    onClick={() => handleUpdateFarmerStatus(farmer._id, 'Rejected')}
                                                    className="px-6 py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold hover:bg-red-100 transition-all"
                                                >
                                                    Reject
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'deliveries' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            key="deliveries"
                            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8"
                        >
                            <h3 className="text-2xl font-black uppercase tracking-tighter mb-8">Delivery Personnel</h3>
                            <div className="grid grid-cols-1 gap-6">
                                {deliveryBoys.map((boy) => (
                                    <div key={boy._id} className="flex justify-between items-center p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h4 className="font-bold text-lg">{boy.name}</h4>
                                                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide ${boy.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                    boy.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {boy.status || 'Pending'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">Vehicle: <span className="text-gray-900 font-medium">{boy.vehicleType} ({boy.vehicleNumber})</span></p>
                                            <p className="text-sm text-gray-500">Phone: <span className="text-gray-900 font-medium">{boy.phone}</span></p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {boy.status !== 'Approved' && (
                                                <button
                                                    onClick={() => handleUpdateDeliveryStatus(boy._id, 'Approved')}
                                                    className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            {boy.status !== 'Rejected' && (
                                                <button
                                                    onClick={() => handleUpdateDeliveryStatus(boy._id, 'Rejected')}
                                                    className="px-6 py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold hover:bg-red-100 transition-all"
                                                >
                                                    Reject
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'orders' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            key="orders"
                            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8"
                        >
                            <h3 className="text-2xl font-black uppercase tracking-tighter mb-8">Order Management</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100 italic text-gray-500 text-xs uppercase tracking-widest">
                                            <th className="px-6 py-4 text-left">Order ID</th>
                                            <th className="px-6 py-4 text-left">Customer</th>
                                            <th className="px-6 py-4 text-left">Total</th>
                                            <th className="px-6 py-4 text-left">Status</th>
                                            <th className="px-6 py-4 text-left">Delivery Boy</th>
                                            <th className="px-6 py-4 text-left">Review</th>
                                            <th className="px-6 py-4 text-left">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 text-sm font-bold">
                                        {orders.map((order) => (
                                            <tr key={order._id} className="hover:bg-gray-50 transition-all group">
                                                <td className="px-6 py-5 text-gray-400">#{order._id.slice(-6).toUpperCase()}</td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span>{order.userid?.regid?.name || 'Guest'}</span>
                                                        <span className="text-[10px] text-gray-400 font-medium">{order.userid?.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">₹{order.totalAmount}</td>
                                                <td className="px-6 py-5">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide
                                                        ${order.status === 'Paid' ? 'bg-indigo-100 text-indigo-700' :
                                                            order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                                order.status === 'Assigned' ? 'bg-amber-100 text-amber-700' :
                                                                    'bg-gray-100 text-gray-600'}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    {order.deliveryBoyId ? (
                                                        <span className="text-indigo-600">{order.deliveryBoyId.name}</span>
                                                    ) : (
                                                        <span className="text-gray-400 italic">Unassigned</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5">
                                                    {order.deliveryReview ? (
                                                        <div className="flex flex-col">
                                                            <span className="text-amber-500">{'★'.repeat(order.deliveryReview.rating)}</span>
                                                            <span className="text-[10px] text-gray-400 font-medium italic line-clamp-1">"{order.deliveryReview.review}"</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-300 italic text-xs">No review</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5">
                                                    {(order.status === 'Paid' || order.status === 'Pending') && !order.deliveryBoyId && (
                                                        <button
                                                            onClick={() => { setSelectedOrder(order); setShowAssignModal(true); }}
                                                            className="px-4 py-2 bg-black text-white rounded-xl text-xs hover:bg-gray-800 transition-all"
                                                        >
                                                            Assign Boy
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'products' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            key="products"
                            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8"
                        >
                            <h3 className="text-2xl font-black uppercase tracking-tighter mb-8">All Products</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {products.map((product) => (
                                    <div key={product._id} className="group border border-gray-100 rounded-[2rem] p-4 hover:shadow-xl transition-all relative">
                                        <div className="aspect-square bg-gray-50 rounded-[1.5rem] mb-4 overflow-hidden relative">
                                            <img
                                                src={`http://localhost:5510/product/${product.productimage}`}
                                                alt={product.productname}
                                                className="w-full h-full object-cover"
                                            />
                                            <span className={`absolute top-2 left-2 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter shadow-sm ${product.stockStatus === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {product.stockStatus}
                                            </span>
                                        </div>
                                        <div className="px-2">
                                            <h4 className="text-lg font-black uppercase tracking-tighter text-gray-900 line-clamp-1">{product.productname}</h4>
                                            <p className="text-xs text-gray-500 mb-1">{product.categoryname} • {product.subcategoryname}</p>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-xl font-black">₹{product.price}</span>
                                                <span className="text-xs font-bold text-gray-400">Qty: {product.stockQuantity}</span>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-2">Shop: {product.shopid?.shopName}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'offers' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            key="offers"
                            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter">Offers & Deals</h3>
                                    <p className="text-gray-500 font-medium">Manage Homepage Promos</p>
                                </div>
                                <button
                                    onClick={() => navigate('/admin/addoffer')}
                                    className="bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-gray-200 transition-all transform hover:scale-105 flex items-center gap-2"
                                >
                                    <Plus className="w-5 h-5" /> Add New Offer
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {offers.map((offer) => (
                                    <div key={offer._id} className="group border border-gray-100 rounded-[2rem] overflow-hidden hover:shadow-xl transition-all relative">
                                        <div className="aspect-video bg-gray-50 relative">
                                            <img
                                                src={`http://localhost:5510/offer/${offer.offerImage}`}
                                                alt={offer.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-6 flex flex-col justify-end text-white">
                                                <span className="bg-red-500 w-fit px-3 py-1 rounded-full text-xs font-black uppercase mb-2">{offer.discount}</span>
                                                <h4 className="text-xl font-black leading-tight">{offer.title}</h4>
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <p className="text-sm text-gray-500 line-clamp-2 mb-4">{offer.description}</p>
                                            <div className="flex justify-between items-center">
                                                <span className={`text-xs font-bold uppercase tracking-widest ${offer.status === 'Active' ? 'text-green-600' : 'text-gray-400'}`}>
                                                    ● {offer.status}
                                                </span>
                                                <button
                                                    onClick={async () => {
                                                        if (window.confirm("Delete this offer?")) {
                                                            try {
                                                                await fetch(`http://localhost:5510/grocery/offer/delete/${offer._id}`, { method: 'DELETE' });
                                                                setOffers(offers.filter(o => o._id !== offer._id));
                                                            } catch (err) {
                                                                console.error(err);
                                                            }
                                                        }
                                                    }}
                                                    className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                    {activeTab === 'leaves' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            key="leaves"
                            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8"
                        >
                            <h3 className="text-2xl font-black uppercase tracking-tighter mb-8">Leave Requests</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100 italic text-gray-500 text-xs uppercase tracking-widest">
                                            <th className="px-6 py-4 text-left">Delivery Boy</th>
                                            <th className="px-6 py-4 text-left">Period</th>
                                            <th className="px-6 py-4 text-left">Reason</th>
                                            <th className="px-6 py-4 text-left">Status</th>
                                            <th className="px-6 py-4 text-left">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 text-sm font-bold">
                                        {leaveRequests.map((leave) => (
                                            <tr key={leave._id} className="hover:bg-gray-50 transition-all group">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                                            {leave.deliveryId?.name?.[0] || 'D'}
                                                        </div>
                                                        <span>{leave.deliveryId?.name || 'Unknown'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-gray-500">
                                                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-5 text-gray-500 max-w-xs truncate" title={leave.reason}>{leave.reason}</td>
                                                <td className="px-6 py-5">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${leave.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                        leave.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                            'bg-amber-100 text-amber-700'
                                                        }`}>
                                                        {leave.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    {leave.status === 'Pending' && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleUpdateLeaveStatus(leave._id, 'Approved')}
                                                                className="px-3 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-xs"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateLeaveStatus(leave._id, 'Rejected')}
                                                                className="px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-xs"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Assignment Modal */}
                <AnimatePresence>
                    {showAssignModal && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowAssignModal(false)}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
                            >
                                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tight">Assign Delivery Boy</h3>
                                        <p className="text-xs font-bold text-gray-400 mt-1 uppercase">Order #{selectedOrder?._id.slice(-6).toUpperCase()}</p>
                                    </div>
                                    <button onClick={() => setShowAssignModal(false)} className="p-2 hover:bg-white rounded-xl transition-all"><X className="w-5 h-5" /></button>
                                </div>
                                <div className="p-8 max-h-[60vh] overflow-y-auto space-y-4">
                                    {deliveryBoys.filter(b => b.status === 'Approved').length > 0 ? (
                                        deliveryBoys.filter(b => b.status === 'Approved').map(boy => (
                                            <div key={boy._id} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl hover:bg-indigo-50 hover:shadow-md transition-all group border border-transparent hover:border-indigo-100">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 font-extrabold text-xl shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                        {boy.name[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-slate-900 group-hover:text-indigo-900">{boy.name}</h4>
                                                        <p className="text-xs font-bold text-slate-400 group-hover:text-indigo-400">{boy.vehicleType} • {boy.vehicleNumber}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleAssignDelivery(boy._id)}
                                                    className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-black text-xs border border-indigo-100 shadow-sm hover:bg-black hover:text-white hover:border-black transition-all"
                                                >
                                                    Assign
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10">
                                            <Truck className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                            <p className="text-gray-400 font-bold italic">No approved delivery boys available</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default AdminDashboard;