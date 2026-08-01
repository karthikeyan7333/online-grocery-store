import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Truck,
    Package,
    MapPin,
    CheckCircle,
    Clock,
    Star,
    LogOut,
    MessageSquare,
    User,
    Settings,
    X as CloseIcon,
    LayoutDashboard,
    DollarSign,
    Activity,
    Edit2,
    Save,
    Calendar,
    ArrowUpRight,
    MessageCircle,
    CalendarOff
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const DeliveryDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'my-tasks', 'history', 'ratings and review'
    const [showProfileModal, setShowProfileModal] = useState(false);

    // Profile Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        name: '',
        email: '',
        phone: '',
        vehicleType: '',
        vehicleNumber: '',
        address: '',
        password: ''
    });

    // OTP State
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [otpInput, setOtpInput] = useState('');
    const [currentVerifyOrderId, setCurrentVerifyOrderId] = useState(null);

    // Leave State
    const [leaves, setLeaves] = useState([]);
    const [leaveForm, setLeaveForm] = useState({ startDate: '', endDate: '', reason: '' });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
            return;
        }
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== 'delivery') {
            navigate('/login');
            return;
        }
        setUser(parsedUser);
        setEditData({
            name: parsedUser.profile.name,
            email: parsedUser.email,
            phone: parsedUser.profile.phone,
            vehicleType: parsedUser.profile.vehicleType,
            vehicleNumber: parsedUser.profile.vehicleNumber,
            address: parsedUser.profile.address,
            password: ''
        });
        fetchOrders(parsedUser.profile._id);
        fetchLeaves(parsedUser.profile._id);
    }, []);

    const fetchOrders = async (deliveryBoyId) => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:5510/grocery/delivery/orders/${deliveryBoyId}`);
            if (response.data.success) {
                setOrders(response.data.orders);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };




    const fetchLeaves = async (deliveryBoyId) => {
        try {
            const response = await axios.get(`http://localhost:5510/grocery/delivery/leave/${deliveryBoyId}`);
            if (response.data.success) {
                setLeaves(response.data.leaves);
            }
        } catch (error) {
            console.error("Error fetching leaves:", error);
        }
    };

    const handleApplyLeave = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5510/grocery/delivery/leave/apply', {
                deliveryId: user.profile._id,
                ...leaveForm
            });
            if (response.data.success) {
                alert("Leave Application Submitted!");
                setLeaveForm({ startDate: '', endDate: '', reason: '' });
                fetchLeaves(user.profile._id);
            }
        } catch (error) {
            console.error("Error applying leave:", error);
            alert("Failed to apply for leave");
        }
    };

    const handleUpdateStatus = async (orderId, status) => {
        if (status === 'Delivered') {
            setCurrentVerifyOrderId(orderId);
            setOtpInput('');
            setShowOTPModal(true);
            return;
        }

        try {
            const response = await axios.put('http://localhost:5510/grocery/delivery/updatestatus', {
                orderId,
                status
            });
            if (response.data.success) {
                fetchOrders(user.profile._id);
                alert(`Order marked as ${status}`);
            }
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status");
        }
    };

    const submitOTP = async () => {
        if (!otpInput || otpInput.length !== 4) {
            alert("Please enter a valid 4-digit OTP");
            return;
        }

        try {
            const response = await axios.put('http://localhost:5510/grocery/delivery/updatestatus', {
                orderId: currentVerifyOrderId,
                status: 'Delivered',
                otp: otpInput
            });
            if (response.data.success) {
                fetchOrders(user.profile._id);
                setShowOTPModal(false);
                setOtpInput('');
                setCurrentVerifyOrderId(null);
                alert("Delivery Verified & Completed Successfully!");
            }
        } catch (error) {
            console.error("Error verifying OTP:", error);
            alert(error.response?.data?.message || "Invalid OTP");
        }
    };

    const handleUpdateProfile = async () => {
        try {
            const response = await axios.put('http://localhost:5510/grocery/delivery/updateprofile', {
                deliveryid: user.profile._id,
                ...editData
            });
            if (response.data.success) {
                const updatedUser = response.data.user;
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setIsEditing(false);
                alert("Profile updated successfully!");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.href = '/login';
    };


    const myTasks = orders.filter(o => (o.deliveryBoyId?._id || o.deliveryBoyId) === user?.profile._id && o.status !== 'Delivered');
    const completedTasks = orders.filter(o => (o.deliveryBoyId?._id || o.deliveryBoyId) === user?.profile._id && o.status === 'Delivered');
    const reviewedTasks = completedTasks.filter(o => o.deliveryReview);

    const stats = [
        { label: 'Total Earnings', value: `₹${completedTasks.reduce((sum, o) => sum + o.totalAmount, 0)}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+12%' },
        { label: 'Orders Finished', value: completedTasks.length.toString(), icon: CheckCircle, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+5' },
        { label: 'Processing', value: myTasks.length.toString(), icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'Active' },
        { label: 'Avg Rating', value: reviewedTasks.length > 0 ? (reviewedTasks.reduce((sum, o) => sum + o.deliveryReview.rating, 0) / reviewedTasks.length).toFixed(1) : '0.0', icon: Star, color: 'text-orange-600', bg: 'bg-orange-50', trend: 'Solid' },
    ];

    if (loading && !user) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-indigo-600">
            <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-gray-200 hidden lg:flex flex-col">
                <div className="p-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                        <Truck className="text-white w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Velo<span className="text-black">Dash</span></span>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
                    <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={LayoutDashboard} label="Dashboard" />

                    <NavItem active={activeTab === 'my-tasks'} onClick={() => setActiveTab('my-tasks')} icon={Clock} label="My Tasks" count={myTasks.length} />
                    <NavItem active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={CheckCircle} label="History" />
                    <NavItem active={activeTab === 'ratings and review'} onClick={() => setActiveTab('ratings and review')} icon={Star} label="Ratings & Review" />
                    <NavItem active={activeTab === 'leave-application'} onClick={() => setActiveTab('leave-application')} icon={CalendarOff} label="Leave Application" />

                </nav>

                <div className="p-4 border-t border-gray-100 flex flex-col gap-2">
                    <div className="p-4 bg-gray-50 rounded-2xl group cursor-pointer border border-transparent hover:border-gray-200 transition-all shadow-sm" onClick={() => setShowProfileModal(true)}>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 font-extrabold text-xl border border-gray-200 shadow-sm">
                                {user?.profile?.name?.[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-900 truncate uppercase">{user?.profile?.name}</p>
                                <p className="text-[10px] font-medium text-gray-400 truncate tracking-tight">{user?.profile?.vehicleNumber}</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content - Fully Scrollable */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Navbar - Sticky */}
                <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 px-10 py-5 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                            {activeTab === 'dashboard' ? 'Business Overview' :
                                activeTab === 'my-tasks' ? 'Current Missions' :
                                    activeTab === 'ratings and review' ? 'Mission Feedback' :
                                        activeTab === 'leave-application' ? 'Leave Application' : 'Service History'}
                            <span className="w-2 h-2 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/20"></span>
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden lg:flex items-center gap-3 px-5 py-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Driver Online</span>
                        </div>
                        <button onClick={() => setShowProfileModal(true)} className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm active:scale-95">
                            <User className="w-6 h-6" />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto bg-[#F8FAFC]">
                    <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-12 pb-24">

                        {/* Dashboard Overview - Only shown on dashboard tab */}
                        {activeTab === 'leave-application' && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                key="leave"
                                className="grid grid-cols-1 lg:grid-cols-3 gap-10"
                            >
                                {/* Leave Form */}
                                <div className="lg:col-span-1 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Apply for Leave</h3>
                                    <form onSubmit={handleApplyLeave} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                                            <input
                                                type="date"
                                                required
                                                value={leaveForm.startDate}
                                                onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                                                className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 rounded-2xl py-4 px-6 text-sm font-bold text-slate-700 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                                            <input
                                                type="date"
                                                required
                                                value={leaveForm.endDate}
                                                onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                                                className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 rounded-2xl py-4 px-6 text-sm font-bold text-slate-700 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason</label>
                                            <textarea
                                                required
                                                rows="4"
                                                value={leaveForm.reason}
                                                onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                                                placeholder="Please briefly explain why..."
                                                className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 rounded-2xl py-4 px-6 text-sm font-bold text-slate-700 outline-none transition-all resize-none"
                                            ></textarea>
                                        </div>
                                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-3">
                                            Submit Application
                                        </button>
                                    </form>
                                </div>

                                {/* Leave History */}
                                <div className="lg:col-span-2 space-y-6">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Application History</h3>
                                    {leaves.length === 0 ? (
                                        <div className="bg-white rounded-[3rem] p-10 border border-slate-100 text-center py-20">
                                            <CalendarOff className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                                            <p className="text-slate-400 font-bold">No leave applications yet.</p>
                                        </div>
                                    ) : (
                                        leaves.map(leave => (
                                            <div key={leave._id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${leave.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                                                            leave.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                                            }`}>{leave.status}</span>
                                                        <span className="text-xs font-bold text-slate-400">{new Date(leave.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <h4 className="text-lg font-black text-slate-900 mb-1">{leave.reason}</h4>
                                                    <p className="text-sm font-bold text-slate-500">
                                                        {new Date(leave.startDate).toLocaleDateString()} — {new Date(leave.endDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'dashboard' && (
                            <div className="space-y-12">
                                {/* Welcome Hero */}
                                <div className="bg-indigo-600 rounded-[3rem] p-10 md:p-14 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
                                    <div className="relative z-10 max-w-xl">
                                        <h3 className="text-4xl md:text-5xl font-black mb-4 leading-tight tracking-tight">Go get 'em, {user?.profile?.name.split(' ')[0]}! 🚀</h3>
                                        <p className="text-indigo-100 text-lg font-medium opacity-90 leading-relaxed mb-8">You're on fire today. Complete 3 more deliveries to hit your weekly bonus goal!</p>
                                        <div className="flex flex-wrap gap-4">
                                            <button onClick={() => setActiveTab('my-tasks')} className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg hover:translate-y-[-2px] transition-all">View My Tasks</button>
                                            <button className="bg-indigo-500/50 backdrop-blur-md border border-indigo-400/30 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all">View Performance</button>
                                        </div>
                                    </div>
                                    <div className="absolute top-1/2 right-20 -translate-y-1/2 hidden xl:block opacity-20 transform scale-150 rotate-12">
                                        <Truck className="w-64 h-64" />
                                    </div>
                                    <div className="absolute top-[-100px] right-[-100px] w-64 h-64 bg-indigo-500 rounded-full blur-[100px]"></div>
                                    <div className="absolute bottom-[-100px] left-[-100px] w-64 h-64 bg-indigo-700 rounded-full blur-[100px]"></div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {stats.map((stat, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group"
                                        >
                                            <div className="flex justify-between items-start mb-6">
                                                <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl shadow-inner group-hover:scale-110 transition-transform`}>
                                                    <stat.icon className="w-6 h-6" />
                                                </div>
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full text-[10px] font-black tracking-widest uppercase text-slate-400">
                                                    {stat.trend} <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                                                </div>
                                            </div>
                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">{stat.label}</p>
                                            <h4 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h4>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Interactive Section */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden h-[400px]">
                                        <div className="flex justify-between items-center mb-8 relative z-10">
                                            <h4 className="text-2xl font-black text-slate-900 tracking-tight">Earnings Flow</h4>
                                            <select className="bg-slate-50 border-none rounded-xl text-xs font-bold p-2.5 outline-none focus:ring-2 ring-indigo-500/20">
                                                <option>Last 7 Days</option>
                                                <option>Monthly</option>
                                            </select>
                                        </div>
                                        {/* Mock Chart Area */}
                                        <div className="flex items-end justify-between h-48 gap-4 mt-12 relative z-10">
                                            {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${h}%` }}
                                                    className="flex-1 bg-indigo-50 rounded-full relative group"
                                                >
                                                    <div className="absolute inset-0 bg-indigo-600 rounded-full scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-500 cursor-pointer"></div>
                                                </motion.div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">
                                            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                                        </div>
                                    </div>

                                    <div className="bg-indigo-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-indigo-900/40 flex flex-col justify-between relative overflow-hidden group">
                                        <div className="relative z-10">
                                            <h4 className="text-2xl font-black tracking-tight mb-4">Daily Goal</h4>
                                            <p className="text-indigo-300 text-sm font-medium leading-relaxed">Reach ₹2000 today to unlock the 'Turbo Driver' badge.</p>
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex justify-between text-sm font-black uppercase tracking-widest mb-4">
                                                <span>Progress</span>
                                                <span className="text-indigo-400">75%</span>
                                            </div>
                                            <div className="h-4 bg-white/10 rounded-full overflow-hidden border border-white/5 p-1">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: '75%' }}
                                                    className="h-full bg-gradient-to-r from-indigo-400 to-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                                                ></motion.div>
                                            </div>
                                        </div>
                                        <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-indigo-500/10 rounded-full group-hover:scale-110 transition-transform"></div>
                                    </div>
                                </div>



                                {/* Recently Completed */}
                                {completedTasks.length > 0 && (
                                    <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm mt-10">
                                        <div className="flex justify-between items-center mb-8">
                                            <h4 className="text-2xl font-black text-slate-900 tracking-tight">Recently Completed</h4>
                                            <button onClick={() => setActiveTab('history')} className="text-emerald-600 font-bold text-sm hover:underline uppercase tracking-widest text-[11px]">View History</button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {completedTasks.slice(0, 4).map(order => (
                                                <div key={order._id} className="flex items-center justify-between p-6 bg-emerald-50/30 rounded-[2rem] border border-emerald-100 group transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm">
                                                            <CheckCircle className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h5 className="font-bold text-slate-900 text-sm">{order.userid?.regid?.name || 'Guest User'}</h5>
                                                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{new Date(order.updatedAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-black text-slate-900 italic">₹{order.totalAmount}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab !== 'dashboard' && activeTab !== 'leave-application' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                {(activeTab === 'my-tasks' ? myTasks : activeTab === 'ratings and review' ? reviewedTasks : completedTasks).map(order => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        key={order._id}
                                        className={`rounded-[3.5rem] shadow-sm border transition-all duration-500 group overflow-hidden ${activeTab === 'ratings and review'
                                            ? 'bg-amber-50/30 border-amber-100 hover:shadow-[0_20px_60px_-15px_rgba(245,158,11,0.1)]'
                                            : 'bg-white border-slate-100 hover:shadow-[0_20px_60px_-15px_rgba(79,70,229,0.1)]'
                                            }`}
                                    >
                                        <div className="p-10">
                                            <div className="flex justify-between items-start mb-10">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <span className="px-4 py-1.5 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest">DRP #{order._id.slice(-6).toUpperCase()}</span>
                                                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                                            activeTab === 'ratings and review' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                                                order.status === 'Assigned' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' :
                                                                    order.status === 'Accepted' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                                        order.status === 'Dispatched' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                                                                            'bg-slate-100 text-slate-500 border border-slate-200'
                                                            }`}>
                                                            {activeTab === 'ratings and review' ? 'Reviewed' : order.status}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight lowercase first-letter:uppercase">{order.userid?.regid?.name || 'Velo Client'}</h3>
                                                </div>
                                                <div className={`w-16 h-16 rounded-[1.75rem] flex items-center justify-center transition-all transform group-hover:rotate-12 ${activeTab === 'ratings and review' ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-300 group-hover:text-indigo-600 group-hover:bg-indigo-50'}`}>
                                                    {activeTab === 'ratings and review' ? <Star className="w-8 h-8 fill-current" /> : <Package className="w-8 h-8" />}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-8 mb-12">
                                                <div className="flex items-start gap-5">
                                                    <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-white border border-transparent group-hover:border-slate-100 transition-all shadow-inner"><MapPin className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" /></div>
                                                    <div className="flex-1">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Drop-off Location</p>
                                                        <p className="text-sm font-bold text-slate-600 leading-relaxed italic">"{order.userid?.regid?.address || 'Restricted Address'}"</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-8">
                                                    <div className="flex items-start gap-5">
                                                        <div className="p-4 bg-slate-50 rounded-2xl shadow-inner"><Clock className="w-5 h-5 text-slate-400" /></div>
                                                        <div className="flex-1">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Priority Level</p>
                                                            <p className="text-sm font-bold text-slate-600">Standard Drop</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-5">
                                                        <div className="p-4 bg-slate-50 rounded-2xl shadow-inner"><DollarSign className="w-5 h-5 text-slate-400" /></div>
                                                        <div className="flex-1">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Your Payout</p>
                                                            <p className="text-xl font-black text-slate-900 tracking-tight">₹{order.totalAmount}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>


                                            {activeTab === 'my-tasks' ? (
                                                <div className="flex flex-col gap-5">
                                                    {order.status === 'Assigned' && (
                                                        <button
                                                            onClick={() => handleUpdateStatus(order._id, 'Accepted')}
                                                            className="w-full bg-indigo-600 hover:bg-slate-950 text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-4"
                                                        >
                                                            Accept Job
                                                        </button>
                                                    )}
                                                    {order.status === 'Accepted' && (
                                                        <button
                                                            onClick={() => handleUpdateStatus(order._id, 'Dispatched')}
                                                            className="w-full bg-amber-500 hover:bg-slate-950 text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-amber-100 transition-all active:scale-95 flex items-center justify-center gap-4"
                                                        >
                                                            Mark Dispatched
                                                        </button>
                                                    )}
                                                    {order.status === 'Dispatched' && (
                                                        <button
                                                            onClick={() => handleUpdateStatus(order._id, 'Delivered')}
                                                            className="w-full bg-emerald-600 hover:bg-slate-950 text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-emerald-100 transition-all active:scale-95 flex items-center justify-center gap-4"
                                                        >
                                                            Confirm Delivery
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="bg-slate-50 border border-slate-100 p-8 rounded-[2rem] flex items-center justify-between shadow-inner">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm border border-slate-100">
                                                            <CheckCircle className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Job Status</p>
                                                            <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Drop Successful</p>
                                                        </div>
                                                    </div>
                                                    {order.deliveryReview ? (
                                                        <div className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl border shadow-sm ${activeTab === 'ratings and review' ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100'}`}>
                                                            <Star className="w-4 h-4 text-orange-500 fill-current" />
                                                            <span className="text-base font-black text-slate-900 leading-none">{order.deliveryReview.rating}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl">
                                                            <Clock className="w-4 h-4 text-slate-400" />
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{new Date(order.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {activeTab === 'ratings and review' && order.deliveryReview?.review && (
                                                <div className="mt-8 p-8 bg-white/50 backdrop-blur-sm rounded-[2.5rem] border-2 border-amber-100/50 shadow-inner relative group/review">
                                                    <div className="absolute -top-3 -left-3 bg-amber-500 text-white p-2 rounded-full shadow-lg">
                                                        <MessageCircle className="w-3 h-3" />
                                                    </div>
                                                    <p className="text-slate-600 font-bold leading-relaxed italic relative z-10">
                                                        "{order.deliveryReview.review}"
                                                    </p>
                                                    <div className="mt-4 flex justify-end">
                                                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">{new Date(order.updatedAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}

                                {(activeTab === 'my-tasks' ? myTasks : activeTab === 'ratings and review' ? reviewedTasks : completedTasks).length === 0 && (
                                    <div className="col-span-full py-40 text-center bg-white rounded-[4rem] border border-dashed border-slate-200">
                                        <div className="inline-flex items-center justify-center w-32 h-32 bg-slate-50 rounded-[3.5rem] mb-10 group-hover:scale-110 transition-transform">
                                            <Activity className="w-14 h-14 text-slate-300" />
                                        </div>
                                        <h3 className="text-4xl font-black text-slate-900 tracking-tight lowercase mb-4">Board is clear.</h3>
                                        <p className="text-slate-400 font-bold max-w-sm mx-auto uppercase tracking-widest text-[11px] leading-loose">Check back in a few minutes for new courier assignments in your region.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Enhanced Profile Modal with EDIT functionality */}
            < AnimatePresence >
                {showProfileModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
                        >
                            {/* Simple Header */}
                            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white relative z-10">
                                <h3 className="text-base font-black text-slate-900 tracking-widest uppercase">Driver Profile</h3>
                                <button onClick={() => { setShowProfileModal(false); setIsEditing(false); }} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                                    <CloseIcon className="w-5 h-5" />
                                </button>
                            </div>
                            {/* Body - Clean & Focused */}
                            <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
                                <div className="flex flex-col items-center mb-8">
                                    <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-600 text-4xl font-extrabold mb-4 border border-slate-100 shadow-sm">
                                        {user?.profile?.name?.[0]?.toUpperCase()}
                                    </div>
                                    <h4 className="text-2xl font-bold text-slate-900 uppercase tracking-tight mb-1">{user?.profile?.name}</h4>
                                    <div className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                        Active Partner
                                    </div>
                                </div>

                                <div className="space-y-4 pb-4">
                                    {isEditing ? (
                                        <div className="grid grid-cols-1 gap-4">
                                            <EditField label="Full Name" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} icon={LayoutDashboard} />
                                            <EditField label="Email Address" value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })} icon={MessageSquare} />
                                            <EditField label="Phone Contact" value={editData.phone} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} icon={Activity} />
                                            <div className="grid grid-cols-2 gap-4">
                                                <EditField label="Vehicle" value={editData.vehicleType} onChange={(e) => setEditData({ ...editData, vehicleType: e.target.value })} icon={Truck} isSelect options={['Bike', 'Scooter', 'Cycle', 'Van']} />
                                                <EditField label="Plate" value={editData.vehicleNumber} onChange={(e) => setEditData({ ...editData, vehicleNumber: e.target.value })} icon={Settings} />
                                            </div>
                                            <EditField label="Update Password" value={editData.password} onChange={(e) => setEditData({ ...editData, password: e.target.value })} icon={LogOut} type="password" placeholder="••••••••" />
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                                                <textarea
                                                    value={editData.address}
                                                    onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                                                    className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-xl p-4 text-xs font-bold text-slate-700 outline-none h-20 transition-all resize-none shadow-inner"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="flex items-center gap-5 p-5 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
                                                <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm"><Activity className="w-5 h-5" /></div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">Phone</p>
                                                    <p className="text-base font-bold text-slate-900 leading-none">{user?.profile?.phone}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-5 p-5 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
                                                <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm"><MessageSquare className="w-5 h-5" /></div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">Email</p>
                                                    <p className="text-base font-bold text-slate-900 truncate max-w-[220px] leading-none">{user?.email}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
                                                    <Truck className="w-5 h-5 text-slate-400 shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">Vehicle</p>
                                                        <p className="text-sm font-bold text-slate-900 truncate leading-none">{user?.profile?.vehicleType}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
                                                    <Settings className="w-5 h-5 text-slate-400 shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">Plate</p>
                                                        <p className="text-sm font-bold text-slate-900 truncate leading-none">{user?.profile?.vehicleNumber}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Base Address</p>
                                                <p className="text-sm font-bold text-slate-600 leading-relaxed italic block">"{user?.profile?.address}"</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer - Professional Action */}
                            <div className="p-8 border-t border-slate-50 bg-white">
                                {isEditing ? (
                                    <div className="flex gap-4">
                                        <button onClick={() => setIsEditing(false)} className="px-6 py-4 rounded-xl font-black uppercase text-xs text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                                        <button onClick={handleUpdateProfile} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2">
                                            <Save className="w-4 h-4" /> Commit Changes
                                        </button>
                                    </div>
                                ) : (
                                    <button onClick={() => setIsEditing(true)} className="w-full bg-slate-950 hover:bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl transition-all flex items-center justify-center gap-4 group">
                                        <Edit2 className="w-5 h-5 group-hover:rotate-12 transition-transform" /> Modify Profile
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence >

            {/* OTP Verification Modal */}
            <AnimatePresence>
                {showOTPModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl relative"
                        >
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
                                    <CheckCircle className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-2">Verify Delivery</h3>
                                <p className="text-slate-500 text-sm font-medium">Enter the 4-digit OTP sent to the customer's email.</p>
                            </div>

                            <div className="mb-6">
                                <input
                                    type="text"
                                    maxLength="4"
                                    value={otpInput}
                                    onChange={(e) => setOtpInput(e.target.value.replace(/[^0-9]/g, ''))}
                                    className="w-full bg-slate-100 border-2 border-transparent focus:bg-white focus:border-indigo-600 rounded-2xl py-4 text-center text-3xl font-black tracking-[0.5em] text-slate-900 outline-none transition-all"
                                    placeholder="••••"
                                    autoFocus
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowOTPModal(false)}
                                    className="flex-1 py-4 rounded-xl font-bold text-slate-400 hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitOTP}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95"
                                >
                                    Verify
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <style jsx="true">{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #E2E8F0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #CBD5E1;
                }
            `}</style>
        </div >
    );
};

// UI Components
const NavItem = ({ active, onClick, icon: Icon, label, count }) => {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
        >
            <Icon className="w-5 h-5" />
            <span className="flex-1 text-left">{label}</span>
            {count > 0 && (
                <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${active ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                    {count}
                </span>
            )}
        </button>
    );
};



const EditField = ({ label, value, onChange, icon: Icon, isSelect, options, type = "text", placeholder }) => (
    <div className="space-y-3">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">{label}</label>
        <div className="relative group">
            <div className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors"><Icon className="w-6 h-6" /></div>
            {isSelect ? (
                <select
                    value={value}
                    onChange={onChange}
                    className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 rounded-[2rem] py-5.5 pl-16 pr-8 text-sm font-bold text-slate-700 outline-none transition-all appearance-none cursor-pointer shadow-inner"
                >
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 rounded-[2rem] py-5.5 pl-16 pr-8 text-sm font-bold text-slate-700 outline-none transition-all shadow-inner"
                />
            )}
        </div>
    </div>
);

export default DeliveryDashboard;
