import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Upload, Tag, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddOffer = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [discount, setDiscount] = useState(''); // e.g. "50% OFF"
    const [offerImage, setOfferImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubCategories] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubcategory, setSelectedSubcategory] = useState('');
    const [isGlobal, setIsGlobal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const prodRes = await fetch('http://localhost:5510/grocery/products/getall');
                const prodData = await prodRes.json();
                if (prodData.success) setProducts(prodData.products);

                const catRes = await fetch('http://localhost:5510/grocery/categories/getall');
                const catData = await catRes.json();
                if (catData.success) setCategories(catData.categories);

                const subRes = await fetch('http://localhost:5510/grocery/subcategories/getall');
                const subData = await subRes.json();
                if (subData.success) setSubCategories(subData.subcategories);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setOfferImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Detailed validation
        if (!title) return alert("Offer Title is required");
        if (!discount) return alert("Discount Label (e.g. 50% OFF) is required");
        if (!description) return alert("Description is required");
        if (!offerImage) return alert("Offer Image is required");

        setLoading(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('discount', discount);
        formData.append('offerImage', offerImage);
        formData.append('isGlobal', isGlobal);

        if (selectedProduct) formData.append('productid', selectedProduct);
        if (selectedCategory) formData.append('categoryid', selectedCategory);
        if (selectedSubcategory) formData.append('subcategoryid', selectedSubcategory);

        try {
            const res = await fetch('http://localhost:5510/grocery/offer/add', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                alert("Offer added successfully!");
                navigate('/admin', { state: { activeTab: 'offers' } });
            } else {
                alert(data.message || "Failed to add offer");
            }
        } catch (error) {
            console.error("Error adding offer:", error);
            alert("Error adding offer");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center gap-4 sticky top-0 z-10">
                <button
                    onClick={() => navigate('/admin', { state: { activeTab: 'offers' } })}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter">Add New Offer</h1>
                    <p className="text-sm text-gray-500 font-bold">Create a store-wide or targeted deal</p>
                </div>
            </div>

            {/* Form */}
            <div className="max-w-4xl mx-auto w-full p-8">
                <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 space-y-8">
                    <div className="flex gap-8 flex-col md:flex-row">
                        {/* Image Upload */}
                        <div className="w-full md:w-1/3 space-y-4">
                            <label className="block text-sm font-black uppercase text-gray-700 tracking-wide">
                                Offer Banner
                            </label>
                            <div className={`aspect-[4/5] rounded-[2rem] border-4 border-dashed relative overflow-hidden group transition-all ${preview ? 'border-green-500 bg-white' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
                                <input
                                    type="file"
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                />
                                {preview ? (
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform">
                                            <Upload className="w-6 h-6 text-gray-400 group-hover:text-black" />
                                        </div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-center px-4">Upload Banner</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Text Fields */}
                        <div className="flex-1 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-700 mb-2">Offer Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. Mega Sale"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-black focus:bg-white transition-all font-bold text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-700 mb-2">Discount Label</label>
                                    <div className="relative">
                                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={discount}
                                            onChange={(e) => setDiscount(e.target.value)}
                                            placeholder="e.g. 50% OFF"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-3 outline-none focus:border-red-500 focus:text-red-600 focus:bg-white transition-all font-black text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/30 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-black uppercase text-gray-500 tracking-widest">Select Target Audience</h4>
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all cursor-pointer ${isGlobal ? 'bg-black text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                        onClick={() => {
                                            setIsGlobal(!isGlobal);
                                            if (!isGlobal) {
                                                setSelectedProduct('');
                                                setSelectedCategory('');
                                                setSelectedSubcategory('');
                                            }
                                        }}>
                                        <Globe className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-black uppercase">Store-wide</span>
                                    </div>
                                </div>

                                {!isGlobal ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">Product</label>
                                            <select
                                                value={selectedProduct}
                                                onChange={(e) => {
                                                    setSelectedProduct(e.target.value);
                                                    setSelectedCategory('');
                                                    setSelectedSubcategory('');
                                                }}
                                                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-black transition-all font-medium text-xs shadow-sm"
                                            >
                                                <option value="">None</option>
                                                {products.map(p => <option key={p._id} value={p._id}>{p.productname}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">Category</label>
                                            <select
                                                value={selectedCategory}
                                                onChange={(e) => {
                                                    setSelectedCategory(e.target.value);
                                                    setSelectedProduct('');
                                                    setSelectedSubcategory('');
                                                }}
                                                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-black transition-all font-medium text-xs shadow-sm"
                                            >
                                                <option value="">None</option>
                                                {categories.map(c => <option key={c._id} value={c._id}>{c.categoryname}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">Sub-Cat</label>
                                            <select
                                                value={selectedSubcategory}
                                                onChange={(e) => {
                                                    setSelectedSubcategory(e.target.value);
                                                    setSelectedProduct('');
                                                    setSelectedCategory('');
                                                }}
                                                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-black transition-all font-medium text-xs shadow-sm"
                                            >
                                                <option value="">None</option>
                                                {subcategories.map(s => <option key={s._id} value={s._id}>{s.subcategoryname}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-black/5 p-4 rounded-2xl border border-black/10 flex items-center gap-4">
                                        <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shadow-lg">
                                            <Globe className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase text-black">Store-wide Mode Active</p>
                                            <p className="text-[10px] text-gray-500 font-bold">This offer will apply to every item in the shop unless overridden by a product-specific deal.</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase text-gray-700 mb-2">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows="3"
                                    placeholder="Describe the offer details..."
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-black focus:bg-white transition-all resize-none font-medium text-sm"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-black text-white hover:bg-gray-900 px-8 py-4 rounded-2xl font-black text-sm shadow-xl transition-all transform hover:translate-y-[-2px] active:scale-95 flex items-center justify-center gap-3"
                            >
                                {loading ? 'Creating...' : <><Save className="w-4 h-4" /> Publish Offer</>}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddOffer;
