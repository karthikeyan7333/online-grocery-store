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
    Pencil,
    Trash2
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const ShopDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'overview');
    const [user, setUser] = useState(null);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    // Notifications State
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.role !== 'shop') {
                navigate('/login');
            }
            setUser(parsedUser);
            setSettings({
                shopName: parsedUser.profile?.shopName || '',
                ownerName: parsedUser.profile?.ownerName || '',
                phone: parsedUser.profile?.phone || ''
            });
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const [settings, setSettings] = useState({ shopName: '', ownerName: '', phone: '' });

    const handleSettingsChange = (e) => {
        const { name, value } = e.target;
        setSettings({ ...settings, [name]: value });
    };

    const saveSettings = () => {
        // Here you would typically send a PUT request to update the shop profile
        // For now, we will just update the local storage to reflect changes immediately for demo
        const updatedUser = { ...user, profile: { ...user.profile, ...settings } };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        alert('Settings saved successfully!');
    };

    // Fetch Products
    useEffect(() => {
        const fetchData = async () => {
            if (user?.profile?._id) {
                setLoading(true);
                try {
                    // Fetch Products
                    const prodRes = await fetch(`http://localhost:5510/grocery/getproducts/${user.profile._id}`);
                    const prodData = await prodRes.json();
                    if (prodData.success) setProducts(prodData.products);

                    // Fetch Orders
                    const orderRes = await fetch(`http://localhost:5510/grocery/shop/orders/${user.profile._id}`);
                    const orderData = await orderRes.json();
                    if (orderData.success) setOrders(orderData.orders);

                } catch (error) {
                    console.error("Error fetching data:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchData();
        fetchNotifications();
    }, [user, activeTab]);

    const fetchNotifications = async () => {
        if (!user?.profile?._id) return;
        try {
            const res = await fetch(`http://localhost:5510/grocery/notifications/get?role=shop&id=${user.profile._id}`);
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
                body: JSON.stringify({ id: 'all', role: 'shop', shopid: user.profile._id })
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

    const handleDownloadBill = (order) => {
        const printWindow = window.open('', '_blank');
        const shopName = user?.profile?.shopName || 'GrocyShop';
        const shopPhone = user?.profile?.phone || '';

        const billContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Invoice #${order._id.slice(-6).toUpperCase()}</title>
                    <style>
                        body { font-family: 'Helvetica', 'Arial', sans-serif; color: #333; padding: 40px; max-width: 800px; mx-auto; }
                        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
                        .logo { font-size: 24px; font-weight: bold; color: #16a34a; }
                        .shop-details { text-align: right; }
                        .invoice-title { font-size: 36px; font-weight: 900; color: #111; margin: 0 0 10px 0; letter-spacing: -1px; }
                        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
                        .label { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #888; margin-bottom: 5px; letter-spacing: 1px; }
                        .value { font-size: 14px; font-weight: 600; line-height: 1.4; }
                        table { w-full; border-collapse: collapse; margin-bottom: 30px; }
                        th { text-align: left; padding: 15px 10px; border-bottom: 2px solid #111; font-weight: 900; font-size: 12px; text-transform: uppercase; }
                        td { padding: 15px 10px; border-bottom: 1px solid #eee; font-size: 14px; vertical-align: middle; }
                        .total-section { display: flex; justify-content: flex-end; margin-top: 30px; }
                        .total-box { w-250px; }
                        .total-row { display: flex; justify-content: space-between; padding: 10px 0; }
                        .gross-total { font-size: 20px; font-weight: 900; border-top: 2px solid #111; padding-top: 15px; margin-top: 10px; }
                        .footer { margin-top: 60px; text-align: center; color: #888; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
                        .status-badge { display: inline-block; padding: 5px 10px; background: #eee; border-radius: 4px; font-weight: bold; font-size: 11px; text-transform: uppercase; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div>
                            <div class="logo">Grocy<span style="color: black;">Shop</span></div>
                            <div style="margin-top: 10px; font-weight: 500;">Invoice #${order._id.slice(-6).toUpperCase()}</div>
                        </div>
                        <div class="shop-details">
                            <div style="font-weight: bold; font-size: 18px;">${shopName}</div>
                            <div>${shopPhone}</div>
                            <div style="color: #666; font-size: 12px; margin-top: 5px;">Date: ${new Date().toLocaleDateString()}</div>
                        </div>
                    </div>

                    <div class="info-grid">
                        <div>
                            <div class="label">Billed To</div>
                            <div class="value">${order.customer?.name}</div>
                            <div class="value" style="color: #666;">${order.customer?.address}</div>
                            <div class="value" style="color: #666;">${order.customer?.phone}</div>
                        </div>
                        <div style="text-align: right;">
                            <div class="label">Order Details</div>
                            <div class="value">Order Date: ${new Date(order.date).toLocaleDateString()}</div>
                            <div style="margin-top: 5px;"><span class="status-badge">${order.status}</span></div>
                        </div>
                    </div>

                    <table style="width: 100%;">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th style="text-align: center;">Qty</th>
                                <th style="text-align: right;">Price</th>
                                <th style="text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr>
                                    <td>
                                        <div style="font-weight: bold;">${item.productname}</div>
                                    </td>
                                    <td style="text-align: center;">${item.quantity}</td>
                                    <td style="text-align: right;">₹${item.price}</td>
                                    <td style="text-align: right; font-weight: bold;">₹${item.price * item.quantity}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="total-section">
                        <div class="total-box">
                            <div class="total-row gross-total">
                                <span>TOTAL</span>
                                <span>₹${order.shopTotal}</span>
                            </div>
                        </div>
                    </div>

                    <div class="footer">
                        <p>Thank you for shopping with ${shopName}!</p>
                        <p>This is a computer generated invoice.</p>
                    </div>
                </body>
            </html>
        `;

        printWindow.document.write(billContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

    const stats = [
        { label: 'Total Revenue', value: '₹12,450', change: '+12.5%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
        { label: 'Total Orders', value: '145', change: '+8.2%', icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Active Products', value: products.length.toString(), change: '0%', icon: Package, color: 'text-purple-600', bg: 'bg-purple-100' },
        { label: 'Avg. Rating', value: '4.8', change: '+0.2', icon: Users, color: 'text-orange-600', bg: 'bg-orange-100' },
    ];

    const recentOrders = [
        { id: '#ORD-7742', customer: 'Sarah Miller', items: 5, total: '₹42.50', status: 'Pending', date: '2 mins ago' },
        { id: '#ORD-7741', customer: 'James Wilson', items: 2, total: '₹18.90', status: 'Delivered', date: '15 mins ago' },
        { id: '#ORD-7740', customer: 'Emma Thompson', items: 12, total: '₹124.00', status: 'Shipped', date: '1 hour ago' },
        { id: '#ORD-7739', customer: 'Robert Brown', items: 3, total: '₹29.10', status: 'Cancelled', date: '3 hours ago' },
    ];

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-gray-200 hidden lg:flex flex-col">
                <div className="p-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                        <ShoppingCart className="text-white w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Grocy<span className="text-green-600">Shop</span></span>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
                    {[
                        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
                        { id: 'addproduct', label: 'Add Product', icon: Plus },
                        { id: 'products', label: 'My Products', icon: Package },
                        { id: 'orders', label: 'Orders', icon: ShoppingCart },
                        { id: 'settings', label: 'Settings', icon: Settings },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (item.id === 'addproduct') {
                                    navigate('/shop/addproduct');
                                } else {
                                    setActiveTab(item.id);
                                }
                            }}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold transition-all ${activeTab === item.id
                                ? 'bg-green-600 text-white shadow-lg shadow-green-100'
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
                            {activeTab.replace('-', ' ')}
                        </h1>
                        <p className="text-gray-500 font-medium">Welcome back, {user?.profile?.ownerName || 'Shop Owner'}</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search everything..."
                                className="pl-11 pr-6 py-3 bg-white border border-gray-200 rounded-2xl w-64 focus:border-green-500 outline-none transition-all shadow-sm"
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
                                                                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notif.type === 'alert' || notif.type === 'warning' ? 'bg-red-500' : 'bg-green-500'}`}></div>
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
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {stats.map((stat, idx) => (
                                    <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl transition-transform group-hover:scale-110`}>
                                                <stat.icon className="w-6 h-6" />
                                            </div>
                                            <div className={`flex items-center gap-1 text-sm font-bold ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>
                                                {stat.change}
                                                {stat.change.startsWith('+') ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                            </div>
                                        </div>
                                        <div className="relative z-10">
                                            <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mb-1">{stat.label}</p>
                                            <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                                        </div>
                                        {/* Background Decoration */}
                                        <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${stat.bg} rounded-full opacity-0 group-hover:opacity-20 transition-opacity`}></div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                {/* Recent Orders */}
                                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                                        <h3 className="text-xl font-black uppercase tracking-tighter">Recent Orders</h3>
                                        <button className="text-green-600 font-bold text-sm hover:underline">View All</button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-gray-50/50 text-gray-400 text-xs font-black uppercase tracking-widest">
                                                    <th className="px-8 py-4">Order ID</th>
                                                    <th className="px-8 py-4">Customer</th>
                                                    <th className="px-8 py-4">Status</th>
                                                    <th className="px-8 py-4">Total</th>
                                                    <th className="px-8 py-4">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {recentOrders.map((order, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                                                        <td className="px-8 py-5 font-bold text-gray-900">{order.id}</td>
                                                        <td className="px-8 py-5 text-gray-600 font-medium">
                                                            <div className="flex flex-col">
                                                                <span>{order.customer}</span>
                                                                <span className="text-[10px] text-gray-400">{order.date}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                                order.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                                                                    order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                                                                        'bg-red-100 text-red-700'
                                                                }`}>
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-5 font-black text-gray-900">{order.total}</td>
                                                        <td className="px-8 py-5">
                                                            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                                                <MoreVertical className="w-5 h-5 text-gray-400" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Stock Alert */}
                                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                                    <h3 className="text-xl font-black uppercase tracking-tighter mb-8">Low Stock Alerts</h3>
                                    <div className="space-y-6">
                                        {products.filter(p => p.stockQuantity < 10).length === 0 ? <p className="text-gray-400 text-sm">No low stock items.</p> : products.filter(p => p.stockQuantity < 10).map((item, idx) => (
                                            <div key={idx} className="flex flex-col gap-2">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="font-bold text-gray-700 uppercase tracking-tighter truncate w-32">{item.productname}</span>
                                                    <span className={`font-black ${item.stockQuantity === 0 ? 'text-red-600' : 'text-orange-500'}`}>{item.stockQuantity} left</span>
                                                </div>
                                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: `${Math.min((item.stockQuantity / 20) * 100, 100)}%` }}
                                                        className={`h-full ${item.stockQuantity === 0 ? 'bg-red-500' : 'bg-orange-500'}`}
                                                    ></motion.div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
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
                            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tighter">Inventory Management</h3>
                                    <p className="text-gray-500 font-medium">Add, update or remove items from your shop.</p>
                                </div>
                                <button
                                    onClick={() => navigate('/shop/addproduct')}
                                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-green-200 transition-all transform hover:scale-105 flex items-center gap-2"
                                >
                                    <Plus className="w-5 h-5" /> Add New Product
                                </button>
                            </div>

                            {loading ? <p className="text-center">Loading products...</p> : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {products.length === 0 ? <p className="text-gray-500">No products added yet.</p> : products.map((product) => (
                                        <div key={product._id} className="group border border-gray-100 rounded-[2rem] p-4 hover:shadow-2xl transition-all relative">
                                            <div className="aspect-square bg-gray-50 rounded-[1.5rem] mb-4 overflow-hidden flex items-center justify-center relative">
                                                <img
                                                    src={`http://localhost:5510/product/${product.productimage}`}
                                                    alt={product.productname}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-green-600/0 group-hover:bg-green-600/10 transition-colors"></div>
                                                {/* Stock Overlay */}
                                                {product.stockQuantity === 0 && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                                                        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-black uppercase">Out of Stock</span>
                                                    </div>
                                                )}
                                                {/* Expired Overlay */}
                                                {(() => {
                                                    const isPerishable = ["milk", "meat", "fish"].includes(product.categoryname?.toLowerCase());
                                                    const isExpired = isPerishable && product.createdAt && (new Date() - new Date(product.createdAt) > 24 * 60 * 60 * 1000);
                                                    if (isExpired) {
                                                        return (
                                                            <div className="absolute top-2 right-2 flex items-center justify-center">
                                                                <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-black uppercase">Expired</span>
                                                            </div>
                                                        )
                                                    }
                                                })()}
                                            </div>
                                            <div className="px-2">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-black uppercase tracking-tighter text-gray-900 truncate flex-1">{product.productname}</h4>
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate('/shop/editproduct', { state: { product } });
                                                            }}
                                                            className="p-1.5 hover:bg-green-50 text-gray-400 hover:text-green-600 rounded-lg transition-colors"
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={async (e) => {
                                                                e.stopPropagation();
                                                                if (window.confirm("Are you sure you want to delete this product?")) {
                                                                    try {
                                                                        const res = await fetch(`http://localhost:5510/grocery/product/delete/${product._id}`, { method: 'DELETE' });
                                                                        const data = await res.json();
                                                                        if (data.success) {
                                                                            setProducts(products.filter(p => p._id !== product._id));
                                                                        } else {
                                                                            alert(data.message);
                                                                        }
                                                                    } catch (err) {
                                                                        console.error(err);
                                                                    }
                                                                }
                                                            }}
                                                            className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-green-600 font-black">₹{product.price}</span>
                                                    <span className="text-xs font-bold text-gray-500">Qty: {product.stockQuantity}</span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {/* Stock Edit Button */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const newQty = prompt("Enter new stock quantity:", product.stockQuantity);
                                                            if (newQty !== null) {
                                                                const qty = parseInt(newQty);
                                                                if (!isNaN(qty)) {
                                                                    // Update Stock API
                                                                    const updateStock = async () => {
                                                                        try {
                                                                            const res = await fetch(`http://localhost:5510/grocery/product/edit/${product._id}`, {
                                                                                method: 'PUT',
                                                                                headers: { 'Content-Type': 'application/json' },
                                                                                body: JSON.stringify({ stockQuantity: qty })
                                                                            });
                                                                            const data = await res.json();
                                                                            if (data.success) {
                                                                                // Update local state
                                                                                setProducts(products.map(p => p._id === product._id ? { ...p, stockQuantity: qty, stockStatus: qty > 0 ? 'Available' : 'Out of Stock' } : p));
                                                                            } else {
                                                                                alert("Failed to update stock");
                                                                            }
                                                                        } catch (err) {
                                                                            console.error(err);
                                                                            alert("Error updating stock");
                                                                        }
                                                                    }
                                                                    updateStock();
                                                                }
                                                            }
                                                        }}
                                                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl text-[10px] font-black uppercase tracking-wide transition-colors"
                                                    >
                                                        Update Stock
                                                    </button>
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
                                                        className={`px-3 py-2 rounded-xl cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center ${product.stockStatus === 'Available' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                                                    >
                                                        <div className={`w-2 h-2 rounded-full ${product.stockStatus === 'Available' ? 'bg-green-600' : 'bg-red-600'}`}></div>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
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
                            <h3 className="text-2xl font-black uppercase tracking-tighter mb-8">Customer Orders</h3>
                            {orders.length === 0 ? (
                                <p className="text-gray-500">No orders found.</p>
                            ) : (
                                <div className="space-y-6">
                                    {orders.map((order) => (
                                        <div key={order._id} className="border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all">
                                            <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-50">
                                                <div>
                                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Order ID: {order._id}</p>
                                                    <h4 className="font-bold text-lg text-gray-900">{order.customer?.name}</h4>
                                                    <p className="text-sm text-gray-500">{order.customer?.address}</p>
                                                    <p className="text-sm text-gray-500">{order.customer?.phone}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter mb-2 inline-block ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                        order.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                                                            order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-red-100 text-red-700'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                    <p className="text-xs text-gray-400 font-bold">{new Date(order.date).toLocaleDateString()}</p>
                                                    <button
                                                        onClick={() => handleDownloadBill(order)}
                                                        className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-lg shadow-green-200 hover:shadow-xl transition-all mt-2"
                                                    >
                                                        Download PDF
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden">
                                                            <img
                                                                src={`http://localhost:5510/product/${item.image}`}
                                                                alt={item.productname}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-bold text-gray-900 line-clamp-1">{item.productname}</p>
                                                            <p className="text-xs text-gray-500 font-bold">Qty: {item.quantity}</p>
                                                        </div>
                                                        <p className="font-bold text-gray-900">₹{item.price * item.quantity}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-6 pt-6 border-t border-gray-50 flex justify-between items-center">
                                                <p className="text-sm text-gray-500 font-bold">Total Bill (Shop Items)</p>
                                                <p className="text-xl font-black text-green-600">₹{order.shopTotal}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'settings' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            key="settings"
                            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 max-w-2xl"
                        >
                            <h3 className="text-2xl font-black uppercase tracking-tighter mb-8">Shop Settings</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Shop Name</label>
                                    <input
                                        type="text"
                                        name="shopName"
                                        value={settings.shopName}
                                        onChange={handleSettingsChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-green-500 focus:bg-white outline-none transition-all font-medium text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Owner Name</label>
                                    <input
                                        type="text"
                                        name="ownerName"
                                        value={settings.ownerName}
                                        onChange={handleSettingsChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-green-500 focus:bg-white outline-none transition-all font-medium text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={settings.phone}
                                        onChange={handleSettingsChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-green-500 focus:bg-white outline-none transition-all font-medium text-gray-900"
                                    />
                                </div>
                                <button
                                    onClick={saveSettings}
                                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-black shadow-xl shadow-green-200 transition-all transform hover:scale-105 active:scale-95 w-full md:w-auto"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </main>
        </div>
    );
};

export default ShopDashboard;
