import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, Package, ShoppingCart, Settings, LogOut, Plus, Search, Bell, Upload, Loader, Folder
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const EditProduct = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [user] = useState(JSON.parse(localStorage.getItem('user')));
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubCategories] = useState([]);
    const [filteredSubCategories, setFilteredSubCategories] = useState([]);

    // Get product from state passed via navigation
    const productToEdit = location.state?.product;

    const [data, setData] = useState({
        productname: productToEdit?.productname || '',
        categoryname: productToEdit?.categoryname || '',
        categoryid: productToEdit?.categoryid || '',
        subcategoryid: productToEdit?.subcategoryid || '',
        subcategoryname: productToEdit?.subcategoryname || '',
        description: productToEdit?.description || '',
        price: productToEdit?.price || '',
        stockQuantity: productToEdit?.stockQuantity || '',
        productimage: null
    });

    const [preview, setPreview] = useState(productToEdit?.productimage ? `http://localhost:5510/product/${productToEdit.productimage}` : null);

    useEffect(() => {
        if (!productToEdit) {
            alert("No product selected to edit");
            navigate('/shop', { state: { activeTab: 'products' } });
            return;
        }

        const fetchData = async () => {
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
        };
        fetchData();
    }, [productToEdit, navigate]);

    useEffect(() => {
        if (data.categoryid) {
            setFilteredSubCategories(subcategories.filter(sub => (sub.categoryid?._id || sub.categoryid) === (data.categoryid?._id || data.categoryid)));
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
        formData.append('categoryid', data.categoryid?._id || data.categoryid);
        formData.append('subcategoryname', data.subcategoryname || '');
        formData.append('subcategoryid', data.subcategoryid?._id || data.subcategoryid || '');
        formData.append('description', data.description);
        formData.append('price', data.price);
        formData.append('stockQuantity', data.stockQuantity);
        if (data.productimage) {
            formData.append('productimage', data.productimage);
        }

        try {
            const response = await fetch(`http://localhost:5510/grocery/product/edit/${productToEdit._id}`, {
                method: 'PUT',
                body: formData
            });
            const resData = await response.json();
            if (resData.success) {
                navigate('/shop', { state: { activeTab: 'products' } });
            } else {
                alert(resData.message || 'Failed to update product');
            }
        } catch (error) {
            console.error(error);
            alert('Error updating product');
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
            <aside className="w-72 bg-white border-r border-gray-200 hidden lg:flex flex-col">
                <div className="p-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                        <ShoppingCart className="text-white w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Grocy<span className="text-green-600">Shop</span></span>
                </div>
                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <button
                        onClick={() => navigate('/shop', { state: { activeTab: 'products' } })}
                        className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold bg-green-600 text-white shadow-lg shadow-green-100"
                    >
                        <Package className="w-5 h-5" />
                        My Products
                    </button>
                </nav>
                <div className="p-4 border-t border-gray-100">
                    <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-all">
                        <LogOut className="w-5 h-5" /> Logout
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto p-4 md:p-10 relative">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Edit Product</h1>
                        <p className="text-gray-500 font-medium">Update product details</p>
                    </div>
                </header>

                <div className="w-full max-w-2xl bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-2">Product Name</label>
                                <input
                                    type="text"
                                    name="productname"
                                    required
                                    value={data.productname}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-green-500 outline-none transition-all font-bold"
                                    placeholder="e.g. Red Apple"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-2">Category</label>
                                <select
                                    name="categoryid"
                                    required
                                    value={data.categoryid?._id || data.categoryid}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-green-500 outline-none transition-all font-bold appearance-none"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat._id}>{cat.categoryname}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-2">SubCategory</label>
                            <select
                                name="subcategoryid"
                                value={data.subcategoryid?._id || data.subcategoryid || ''}
                                onChange={handleChange}
                                disabled={!data.categoryid}
                                className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-green-500 outline-none transition-all font-bold appearance-none disabled:opacity-50"
                            >
                                <option value="">Select SubCategory (Optional)</option>
                                {filteredSubCategories.map((sub) => (
                                    <option key={sub._id} value={sub._id}>{sub.subcategoryname}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-2">Product Image</label>
                            <div className="relative group">
                                <input
                                    type="file"
                                    name="productimage"
                                    onChange={handleChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className={`w-full p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${preview ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50 hover:border-green-400 hover:bg-gray-100'}`}>
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
                                rows="3"
                                value={data.description}
                                onChange={handleChange}
                                className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-green-500 outline-none transition-all font-medium resize-none"
                                placeholder="Describe this product..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-2">Price (₹)</label>
                                <input
                                    type="number"
                                    name="price"
                                    required
                                    value={data.price}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-green-500 outline-none transition-all font-bold"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-2">Stock Quantity</label>
                                <input
                                    type="number"
                                    name="stockQuantity"
                                    required
                                    min="0"
                                    value={data.stockQuantity}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-green-500 outline-none transition-all font-bold"
                                    placeholder="Enter available quantity"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-green-200 hover:bg-green-700 transition-all transform active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {loading && <Loader className="w-5 h-5 animate-spin" />}
                            {loading ? 'Updating Product...' : 'Update Product'}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/shop', { state: { activeTab: 'products' } })}
                            className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold uppercase tracking-widest hover:bg-gray-200 transition-all mt-4"
                        >
                            Cancel
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default EditProduct;
