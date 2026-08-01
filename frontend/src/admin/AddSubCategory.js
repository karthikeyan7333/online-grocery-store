import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, Package, ShoppingCart, Settings, LogOut, Plus, Search, Bell, Upload, Loader, Folder, Store
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddSubCategory = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [user] = useState(JSON.parse(localStorage.getItem('user')));
    const [categories, setCategories] = useState([]);

    // Form Data
    const [data, setData] = useState({
        subcategoryname: '',
        categoryid: '',
        categoryname: '',
        subcategoryimage: null
    });

    const [preview, setPreview] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            if (user) {
                try {
                    const response = await fetch(`http://localhost:5510/grocery/categories/getall`);
                    const result = await response.json();
                    if (result.success) {
                        setCategories(result.categories);
                    }
                } catch (error) {
                    console.error("Error fetching categories:", error);
                }
            }
        };
        fetchCategories();
    }, [user]);

    const handleChange = (e) => {
        if (e.target.name === 'categoryid') {
            const selectedCategory = categories.find(cat => cat._id === e.target.value);
            setData({
                ...data,
                categoryid: e.target.value,
                categoryname: selectedCategory ? selectedCategory.categoryname : ''
            });
        } else if (e.target.name === 'subcategoryimage') {
            const file = e.target.files[0];
            setData({ ...data, subcategoryimage: file });
            setPreview(URL.createObjectURL(file));
        } else {
            setData({ ...data, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('subcategoryname', data.subcategoryname);
        formData.append('categoryid', data.categoryid);
        // Removed shopid
        formData.append('subcategoryimage', data.subcategoryimage);

        try {
            const response = await fetch('http://localhost:5510/grocery/addsubcategory', {
                method: 'POST',
                body: formData
            });
            const resData = await response.json();
            if (resData.success) {
                navigate('/admin', { state: { activeTab: 'subcategories' } });
            } else {
                alert(resData.message || 'Failed to add subcategory');
            }
        } catch (error) {
            console.error(error);
            alert('Error adding subcategory');
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
                        { id: 'settings', label: 'Settings', icon: Settings },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (item.id === 'addcategory') navigate('/admin/addcategory');
                                else if (item.id === 'addsubcategory') navigate('/admin/addsubcategory');
                                else navigate('/admin', { state: { activeTab: item.id } });
                            }}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold transition-all ${item.id === 'addsubcategory'
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
                            Add SubCategory
                        </h1>
                        <p className="text-gray-500 font-medium">Add a subcategory under a main category</p>
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
                        <button className="relative p-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all shadow-sm">
                            <Bell className="w-5 h-5 text-gray-600" />
                            <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                    </div>
                </header>

                <div className="w-full max-w-2xl bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-2">Parent Category</label>
                            <select
                                name="categoryid"
                                required
                                value={data.categoryid}
                                onChange={handleChange}
                                className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-black outline-none transition-all font-bold appearance-none"
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.categoryname}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-2">SubCategory Name</label>
                            <input
                                type="text"
                                name="subcategoryname"
                                required
                                value={data.subcategoryname}
                                onChange={handleChange}
                                className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-black outline-none transition-all font-bold"
                                placeholder="e.g. Organic Fruits"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-2">SubCategory Image</label>
                            <div className="relative group">
                                <input
                                    type="file"
                                    name="subcategoryimage"
                                    required
                                    onChange={handleChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className={`w-full p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${preview ? 'border-black bg-gray-50' : 'border-gray-200 bg-gray-50 hover:border-black hover:bg-gray-100'}`}>
                                    {preview ? (
                                        <div className="relative w-full h-48 rounded-xl overflow-hidden mb-2">
                                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                            <Upload className="w-8 h-8 text-black" />
                                        </div>
                                    )}
                                    <span className="font-bold text-gray-600">
                                        {preview ? 'Click to change image' : 'Click to upload image'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-gray-300 hover:bg-gray-800 transition-all transform active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {loading && <Loader className="w-5 h-5 animate-spin" />}
                            {loading ? 'Adding SubCategory...' : 'Add SubCategory'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default AddSubCategory;
