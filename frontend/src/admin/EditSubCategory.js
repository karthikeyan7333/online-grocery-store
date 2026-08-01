import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, Plus, Search, Bell, Upload, Loader, Folder, LogOut
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const EditSubCategory = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);

    // Get subcategory from state passed via navigation
    const subcategoryToEdit = location.state?.subcategory;

    const [data, setData] = useState({
        subcategoryname: subcategoryToEdit?.subcategoryname || '',
        categoryid: (subcategoryToEdit?.categoryid?._id || subcategoryToEdit?.categoryid) || '',
        subcategoryimage: null
    });

    const [preview, setPreview] = useState(subcategoryToEdit?.subcategoryimage ? `http://localhost:5510/subcategory/${subcategoryToEdit.subcategoryimage}` : null);

    useEffect(() => {
        if (!subcategoryToEdit) {
            alert("No subcategory selected to edit");
            navigate('/admin', { state: { activeTab: 'subcategories' } });
            return;
        }

        const fetchCategories = async () => {
            try {
                const res = await fetch('http://localhost:5510/grocery/categories/getall');
                const catData = await res.json();
                if (catData.success) {
                    setCategories(catData.categories);
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchCategories();
    }, [subcategoryToEdit, navigate]);

    const handleChange = (e) => {
        if (e.target.name === 'subcategoryimage') {
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
        if (data.subcategoryimage) {
            formData.append('subcategoryimage', data.subcategoryimage);
        }

        try {
            const response = await fetch(`http://localhost:5510/grocery/subcategory/edit/${subcategoryToEdit._id}`, {
                method: 'PUT',
                body: formData
            });
            const resData = await response.json();
            if (resData.success) {
                navigate('/admin', { state: { activeTab: 'subcategories' } });
            } else {
                alert(resData.message || 'Failed to update subcategory');
            }
        } catch (error) {
            console.error(error);
            alert('Error updating subcategory');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* Sidebar (simplified for editing view) */}
            <aside className="w-72 bg-white border-r border-gray-200 hidden lg:flex flex-col">
                <div className="p-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                        <LayoutDashboard className="text-white w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Grocy<span className="text-black">Admin</span></span>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <button
                        onClick={() => navigate('/admin', { state: { activeTab: 'subcategories' } })}
                        className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold bg-black text-white shadow-lg"
                    >
                        <Folder className="w-5 h-5" />
                        Sub Categories
                    </button>
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold text-red-500 hover:bg-red-50">
                        <LogOut className="w-5 h-5" /> Logout
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto p-4 md:p-10">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Edit Sub Category</h1>
                        <p className="text-gray-500 font-medium">Update sub category details</p>
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
                                className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-black outline-none transition-all font-bold"
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.categoryname}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-2">Sub Category Name</label>
                            <input
                                type="text"
                                name="subcategoryname"
                                required
                                value={data.subcategoryname}
                                onChange={handleChange}
                                className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-black outline-none transition-all font-bold"
                                placeholder="e.g. Leafy Greens"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-2">Sub Category Image</label>
                            <div className="relative group">
                                <input
                                    type="file"
                                    name="subcategoryimage"
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
                            {loading ? 'Updating...' : 'Update Sub Category'}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/admin', { state: { activeTab: 'subcategories' } })}
                            className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold uppercase tracking-widest hover:bg-gray-200 transition-all"
                        >
                            Cancel
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default EditSubCategory;
