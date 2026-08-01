import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Package, ShoppingCart, Settings, LogOut, Plus, Search, Bell, Upload, Loader, Folder
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddProduct = () => {
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
      // Fetch global data
      if (user) {
        try {
          // Fetch Categories
          const catRes = await fetch(`http://localhost:5510/grocery/categories/getall`);
          const catData = await catRes.json();
          if (catData.success) {
            setCategories(catData.categories);
          }

          // Fetch SubCategories
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
    formData.append('shopid', user?.profile?._id);

    try {
      const response = await fetch('http://localhost:5510/grocery/addproduct', {
        method: 'POST',
        body: formData
      });
      const resData = await response.json();
      if (resData.success) {
        navigate('/shop', { state: { activeTab: 'products' } });
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
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
            <ShoppingCart className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">Grocy<span className="text-green-600">Shop</span></span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
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
                if (item.id === 'addproduct') navigate('/shop/addproduct');
                else {
                  navigate('/shop', { state: { activeTab: item.id } });
                }
              }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold transition-all ${item.id === 'addproduct'
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
              Add Product
            </h1>
            <p className="text-gray-500 font-medium">Add a new item to your inventory</p>
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
                  value={data.categoryid}
                  onChange={handleChange}
                  className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-green-500 outline-none transition-all font-bold appearance-none"
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
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-2">SubCategory</label>
              <select
                name="subcategoryid"
                value={data.subcategoryid || ''}
                onChange={handleChange}
                disabled={!data.categoryid}
                className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-green-500 outline-none transition-all font-bold appearance-none disabled:opacity-50"
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
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-2">Product Image</label>
              <div className="relative group">
                <input
                  type="file"
                  name="productimage"
                  required
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
                <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-2">
                  Stock Quantity
                </label>
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
              {loading ? 'Adding Product...' : 'Add Product'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddProduct;
