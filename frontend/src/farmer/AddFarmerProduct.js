import React, { useState, useEffect } from 'react';
import {
    Plus, Upload, Loader, Sprout, ArrowLeft, Package, Star, LayoutDashboard, LogOut, Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddFarmerProduct = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [user] = useState(JSON.parse(localStorage.getItem('user')));
    const [categories, setCategories] = useState([]);
    const [data, setData] = useState({
        productname: '',
        categoryname: '',
        categoryid: '',
        subcategoryid: '',
        subcategoryname: '',
        description: '',
        price: '',
        stockQuantity: '',
        productimage: null
    });

    const [preview, setPreview] = useState(null);
    const [subcategories, setSubCategories] = useState([]);
    const [filteredSubCategories, setFilteredSubCategories] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                try {
                    const catRes = await fetch(`http://localhost:5510/grocery/categories/getall`);
                    const catData = await catRes.json();
                    if (catData.success) {
                        setCategories(catData.categories);
                    }

                    const subRes = await fetch(`http://localhost:5510/grocery/subcategories/getall`);
                    const subData = await subRes.json();
                    if (subData.success) {
                        setSubCategories(subData.subcategories);
                    }
                } catch (error) {
                    console.error("Error fetching data:", error);
                }
            }
        };
        fetchData();
    }, [user]);

    useEffect(() => {
        if (data.categoryid) {
            setFilteredSubCategories(subcategories.filter(sub => sub.categoryid?._id === data.categoryid || sub.categoryid === data.categoryid));
        } else {
            setFilteredSubCategories([]);
        }
    }, [data.categoryid, subcategories]);

    const handleChange = (e) => {
        if (e.target.name === 'productimage') {
            const file = e.target.files[0];
            setData({ ...data, productimage: file });
            setPreview(URL.createObjectURL(file));
        } else if (e.target.name === 'categoryid') {
            const selectedCategory = categories.find(cat => cat._id === e.target.value);
            setData({
                ...data,
                categoryid: e.target.value,
                categoryname: selectedCategory ? selectedCategory.categoryname : '',
                subcategoryid: '',
                subcategoryname: ''
            });
        } else if (e.target.name === 'subcategoryid') {
            const selectedSub = subcategories.find(sub => sub._id === e.target.value);
            setData({
                ...data,
                subcategoryid: e.target.value,
                subcategoryname: selectedSub ? selectedSub.subcategoryname : ''
            });
        } else {
            setData({ ...data, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('productname', data.productname);
        formData.append('categoryname', data.categoryname);
        formData.append('categoryid', data.categoryid);
        formData.append('subcategoryname', data.subcategoryname || '');
        formData.append('subcategoryid', data.subcategoryid || '');
        formData.append('description', data.description);
        formData.append('price', data.price);
        formData.append('stockQuantity', data.stockQuantity);
        formData.append('productimage', data.productimage);
        formData.append('farmerid', user?.profile?._id);

        try {
            const response = await fetch('http://localhost:5510/grocery/farmer/addproduct', {
                method: 'POST',
                body: formData
            });
            const resData = await response.json();
            if (resData.success) {
                navigate('/farmer', { state: { activeTab: 'products' } });
            } else {
                alert(resData.message || 'Failed to add product');
            }
        } catch (error) {
            console.error(error);
            alert('Error adding product');
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
                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                        <Sprout className="text-white w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Farm<span className="text-emerald-600">Fresh</span></span>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {[
                        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                        { id: 'addproduct', label: 'Add Harvest', icon: Plus },
                        { id: 'products', label: 'My Produce', icon: Package },
                        { id: 'reviews', label: 'Feedback', icon: Star },
                        { id: 'settings', label: 'Profile', icon: Settings },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (item.id === 'addproduct') navigate('/farmer/addproduct');
                                else navigate('/farmer', { state: { activeTab: item.id } });
                            }}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold transition-all ${item.id === 'addproduct'
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
                <header className="flex items-center gap-4 mb-10">
                    <button onClick={() => navigate('/farmer')} className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-emerald-600 transition-all shadow-sm">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Add New Harvest</h1>
                        <p className="text-gray-500 font-medium">List a new product from your farm to the market</p>
                    </div>
                </header>

                <div className="w-full max-w-2xl bg-white rounded-[3rem] p-12 shadow-xl border border-gray-50">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Harvest Name</label>
                                <input
                                    type="text"
                                    name="productname"
                                    required
                                    value={data.productname}
                                    onChange={handleChange}
                                    className="w-full p-5 bg-gray-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:border-emerald-500 outline-none transition-all font-bold text-gray-900"
                                    placeholder="e.g. Organic Tomatoes"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Market Category</label>
                                <select
                                    name="categoryid"
                                    required
                                    value={data.categoryid}
                                    onChange={handleChange}
                                    className="w-full p-5 bg-gray-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:border-emerald-500 outline-none transition-all font-bold text-gray-900 appearance-none"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat._id}>
                                            {cat.categoryname}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">SubCategory</label>
                            <select
                                name="subcategoryid"
                                value={data.subcategoryid || ''}
                                onChange={handleChange}
                                disabled={!data.categoryid}
                                className="w-full p-5 bg-gray-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:border-emerald-500 outline-none transition-all font-bold text-gray-900 appearance-none disabled:opacity-50"
                            >
                                <option value="">Select SubCategory (Optional)</option>
                                {filteredSubCategories.map((sub) => (
                                    <option key={sub._id} value={sub._id}>
                                        {sub.subcategoryname}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Harvest Image</label>
                            <div className="relative group/upload">
                                <input
                                    type="file"
                                    name="productimage"
                                    required
                                    onChange={handleChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className={`w-full p-10 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center transition-all ${preview ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-100 bg-gray-50 group-hover/upload:border-emerald-400 group-hover/upload:bg-gray-100'}`}>
                                    {preview ? (
                                        <div className="relative w-full h-56 rounded-2xl overflow-hidden mb-4 shadow-lg">
                                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover/upload:scale-110 transition-transform text-emerald-600">
                                            <Upload className="w-7 h-7" />
                                        </div>
                                    )}
                                    <span className="font-black text-xs uppercase tracking-widest text-gray-500">
                                        {preview ? 'Change Image' : 'Snap a Fresh Photo'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Harvest Description</label>
                            <textarea
                                name="description"
                                required
                                rows="4"
                                value={data.description}
                                onChange={handleChange}
                                className="w-full p-6 bg-gray-50 border border-transparent rounded-[2rem] focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium text-gray-600 resize-none"
                                placeholder="Tell us about how this was harvested..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Price per Unit (₹)</label>
                                <input
                                    type="number"
                                    name="price"
                                    required
                                    value={data.price}
                                    onChange={handleChange}
                                    className="w-full p-5 bg-gray-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:border-emerald-500 outline-none transition-all font-bold text-gray-900"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">Quantity (kg/units)</label>
                                <input
                                    type="number"
                                    name="stockQuantity"
                                    required
                                    min="0"
                                    value={data.stockQuantity}
                                    onChange={handleChange}
                                    className="w-full p-5 bg-gray-50 border border-transparent rounded-[1.5rem] focus:bg-white focus:border-emerald-500 outline-none transition-all font-bold text-gray-900"
                                    placeholder="Available stock"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-emerald-200 hover:bg-emerald-700 transition-all transform active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3 mt-8"
                        >
                            {loading && <Loader className="w-5 h-5 animate-spin" />}
                            {loading ? 'Submitting to Market...' : 'Publish Harvest'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default AddFarmerProduct;
