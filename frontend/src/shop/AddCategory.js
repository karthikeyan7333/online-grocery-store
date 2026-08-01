import React, { useState } from 'react';
import {
    LayoutDashboard, Package, ShoppingCart, Settings, LogOut, Plus, Search, Bell, Upload, Loader, Folder
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddCategory = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [user] = useState(JSON.parse(localStorage.getItem('user')));
    const [data, setData] = useState({
        categoryname: '',
        description: '',
        categoryimage: null
    });
    const [preview, setPreview] = useState(null);

    const handleChange = (e) => {
        if (e.target.name === 'categoryimage') {
            const file = e.target.files[0];
            setData({ ...data, categoryimage: file });
            setPreview(URL.createObjectURL(file));
        } else {
            setData({ ...data, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('categoryname', data.categoryname);
        formData.append('description', data.description);
        formData.append('categoryimage', data.categoryimage);
        formData.append('shopid', user?.profile?._id);

        try {
            const response = await fetch('http://localhost:5510/grocery/addcategory', {
                method: 'POST',
                body: formData
            });
            const resData = await response.json();
            if (resData.success) {
                navigate('/shop', { state: { activeTab: 'categories' } });
            } else {
                alert(resData.message || 'Failed to add category');
            }
        } catch (error) {
            console.error(error);
            alert('Error adding category');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

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

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {[
                        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
                        { id: 'addproduct', label: 'Add Product', icon: Plus },
                        { id: 'addcategory', label: 'Add Category', icon: Plus },
                        { id: 'products', label: 'My Products', icon: Package },
                        { id: 'categories', label: 'Categories', icon: Folder },
                        { id: 'orders', label: 'Orders', icon: ShoppingCart },
                        { id: 'settings', label: 'Settings', icon: Settings },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (item.id === 'addproduct') navigate('/shop/addproduct');
                                else if (item.id === 'addcategory') navigate('/shop/addcategory');
                                else {
                                    navigate('/shop', { state: { activeTab: item.id } });
                                }
                            }}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold transition-all ${item.id === 'addcategory'
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
                            Add Category
                        </h1>
                        <p className="text-gray-500 font-medium">Create a new category for your products</p>
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
                        <button className="relative p-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all shadow-sm">
                            <Bell className="w-5 h-5 text-gray-600" />
                            <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                    </div>
                </header>

                <div className="w-full max-w-2xl bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-2">Category Name</label>
                            <input
                                type="text"
                                name="categoryname"
                                required
                                value={data.categoryname}
                                onChange={handleChange}
                                className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-green-500 outline-none transition-all font-bold"
                                placeholder="e.g. Fresh Vegetables"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-2">Category Image</label>
                            <div className="relative group">
                                <input
                                    type="file"
                                    name="categoryimage"
                                    required
                                    onChange={handleChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className={`w - full p - 8 border - 2 border - dashed rounded - 2xl flex flex - col items - center justify - center transition - all ${preview ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50 hover:border-green-400 hover:bg-gray-100'} `}>
                                    {preview ? (
                                        <div className="relative w-full h-48 rounded-xl overflow-hidden mb-2">
                                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                            <Upload className="w-8 h-8 text-green-600" />
                                        </div>
                                    )}
                                    <span className="font-bold text-gray-600">
                                        {preview ? 'Click to change image' : 'Click to upload image'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-2">Description</label>
                            <textarea
                                name="description"
                                required
                                rows="4"
                                value={data.description}
                                onChange={handleChange}
                                className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-green-500 outline-none transition-all font-medium resize-none"
                                placeholder="Describe this category..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-green-200 hover:bg-green-700 transition-all transform active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {loading && <Loader className="w-5 h-5 animate-spin" />}
                            {loading ? 'Creating...' : 'Create Category'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default AddCategory;