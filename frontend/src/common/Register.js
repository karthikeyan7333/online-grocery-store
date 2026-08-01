import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('customer');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [shopData, setShopData] = useState({
    shopName: '',
    ownerName: '',
    phone: '',
    email: '',
    password: ''
  });
  const [customerData, setCustomerData] = useState({
    name: '',
    address: '',
    phone: '',
    dob: '',
    age: '',
    email: '',
    password: ''
  });

  const [deliveryData, setDeliveryData] = useState({
    name: '',
    address: '',
    phone: '',
    vehicleType: '',
    vehicleNumber: '',
    email: '',
    password: ''
  });

  const [farmerData, setFarmerData] = useState({
    name: '',
    address: '',
    phone: '',
    farmName: '',
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});

  // Calculate age automatically when DOB changes
  useEffect(() => {
    if (customerData.dob) {
      const birthDate = new Date(customerData.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setCustomerData(prev => ({ ...prev, age: age >= 0 ? age : 0 }));
    }
  }, [customerData.dob]);

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomerData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleShopChange = (e) => {
    const { name, value } = e.target;
    setShopData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleDeliveryChange = (e) => {
    const { name, value } = e.target;
    setDeliveryData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFarmerChange = (e) => {
    const { name, value } = e.target;
    setFarmerData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = (data, type) => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    if (type === 'customer' || type === 'delivery' || type === 'farmer') {
      if (!data.name?.trim()) newErrors.name = 'Full Name is required';
      else if (data.name.length < 3) newErrors.name = 'Name must be at least 3 characters';
    }

    if (type === 'shop') {
      if (!data.shopName?.trim()) newErrors.shopName = 'Shop Name is required';
      if (!data.ownerName?.trim()) newErrors.ownerName = 'Owner Name is required';
    }

    if (type === 'farmer' && !data.farmName?.trim()) {
      newErrors.farmName = 'Farm Name is required';
    }

    if (!data.phone) newErrors.phone = 'Phone number is required';
    else if (!phoneRegex.test(data.phone)) newErrors.phone = 'Enter a valid 10-digit phone number';

    if (!data.email) newErrors.email = 'Email is required';
    else if (!emailRegex.test(data.email)) newErrors.email = 'Enter a valid email address';

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!data.password) newErrors.password = 'Password is required';
    else if (!passwordRegex.test(data.password)) {
      newErrors.password = 'Password must be at least 8 characters, include uppercase, lowercase, number and special character';
    }

    if ((type === 'customer' || type === 'delivery' || type === 'farmer') && !data.address?.trim()) {
      newErrors.address = 'Address is required';
    }

    if (type === 'customer') {
      if (!data.dob) newErrors.dob = 'Date of Birth is required';
      else if (data.age < 18) newErrors.dob = 'You must be at least 18 years old to register';
    }

    if (type === 'delivery') {
      if (!data.vehicleType) newErrors.vehicleType = 'Vehicle type is required';
      if (!data.vehicleNumber?.trim()) newErrors.vehicleNumber = 'Vehicle number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(customerData, 'customer')) return;
    try {
      const response = await fetch('http://localhost:5510/grocery/register/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Registration successful! Redirecting to login...' });
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Registration failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Server error. Please try again later.' });
    }
  };

  const handleShopSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(shopData, 'shop')) return;
    try {
      const response = await fetch('http://localhost:5510/grocery/register/shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shopData)
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Shop registered successfully! Redirecting to login...' });
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Registration failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Server error. Please try again later.' });
    }
  };

  const handleDeliverySubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(deliveryData, 'delivery')) return;
    try {
      const response = await fetch('http://localhost:5510/grocery/register/delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deliveryData)
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Delivery boy registered successfully! Waiting for admin approval.' });
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Registration failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Server error. Please try again later.' });
    }
  };

  const handleFarmerSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(farmerData, 'farmer')) return;
    try {
      const response = await fetch('http://localhost:5510/grocery/register/farmer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(farmerData)
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Farmer registered successfully! Waiting for admin approval.' });
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Registration failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Server error. Please try again later.' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-green-100">

        {/* Visual Side Panel */}
        <div className="hidden md:flex md:w-1/3 bg-green-600 p-8 flex-col justify-between text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
            <p className="text-green-100 text-sm">Experience the freshest groceries delivered right to your doorstep or manage your shop efficiently.</p>
          </div>
          <div className="relative z-10">
            <div className="w-12 h-1 bg-white/30 mb-4 rounded-full"></div>
            <p className="text-xs text-green-200">© 2026 Online Grocery Inc.</p>
          </div>

          <div className="absolute -top-10 -left-10 w-40 h-40 bg-green-500 rounded-full opacity-20"></div>
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-emerald-400 rounded-full opacity-10"></div>
        </div>

        {/* Form Area */}
        <div className="w-full md:w-2/3 p-8 md:p-12 relative">
          <button
            onClick={() => navigate('/')}
            className="absolute top-6 left-8 flex items-center gap-2 text-gray-400 hover:text-green-600 transition-colors font-semibold text-xs group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </button>
          <div className="mb-8 pt-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Create Account</h1>
            <p className="text-gray-500 text-sm">Please select your registration type</p>
          </div>

          {message.text && (
            <div className={`mb-6 p-4 rounded-xl text-sm font-semibold ${message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
              {message.text}
            </div>
          )}
          {/* Role Selection Toggle */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-1.5 bg-gray-100 rounded-2xl mb-8">
            <button
              type="button"
              onClick={() => { setUserType('customer'); setMessage({ type: '', text: '' }); setErrors({}); }}
              className={`py-2.5 px-2 text-xs md:text-sm font-semibold rounded-xl transition-all duration-300 ${userType === 'customer' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => { setUserType('shop'); setMessage({ type: '', text: '' }); setErrors({}); }}
              className={`py-2.5 px-2 text-xs md:text-sm font-semibold rounded-xl transition-all duration-300 ${userType === 'shop' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Shop Owner
            </button>
            <button
              type="button"
              onClick={() => { setUserType('delivery'); setMessage({ type: '', text: '' }); setErrors({}); }}
              className={`py-2.5 px-2 text-xs md:text-sm font-semibold rounded-xl transition-all duration-300 ${userType === 'delivery' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Delivery Boy
            </button>
            <button
              type="button"
              onClick={() => { setUserType('farmer'); setMessage({ type: '', text: '' }); setErrors({}); }}
              className={`py-2.5 px-2 text-xs md:text-sm font-semibold rounded-xl transition-all duration-300 ${userType === 'farmer' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Farmer
            </button>
          </div>

          {userType === 'customer' && (
            <form onSubmit={handleCustomerSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase ml-1">Full Name</label>
                  <input
                    type="text" name="name" required value={customerData.name} onChange={handleCustomerChange}
                    className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${errors.name ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200'} focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-200 outline-none transition-all`}
                    placeholder="John Doe"
                  />
                  {errors.name && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.name}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase ml-1">Phone Number</label>
                  <input
                    type="tel" name="phone" required value={customerData.phone} onChange={handleCustomerChange}
                    className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${errors.phone ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200'} focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-200 outline-none transition-all`}
                    placeholder="+1 234 567 890"
                  />
                  {errors.phone && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.phone}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 uppercase ml-1">Address</label>
                <textarea
                  name="address" required value={customerData.address} onChange={handleCustomerChange} rows="2"
                  className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${errors.address ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200'} focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-200 outline-none transition-all resize-none`}
                  placeholder="Enter your full address"
                />
                {errors.address && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase ml-1">Date of Birth</label>
                  <input
                    type="date" name="dob" required value={customerData.dob} onChange={handleCustomerChange}
                    className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${errors.dob ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200'} focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-200 outline-none transition-all`}
                  />
                  {errors.dob && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.dob}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase ml-1">Age (Calculated)</label>
                  <input
                    type="number" name="age" readOnly value={customerData.age}
                    className="w-full px-4 py-3 rounded-xl bg-gray-200 border border-gray-200 text-gray-600 outline-none cursor-not-allowed"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 uppercase ml-1">Email Address</label>
                <input
                  type="email" name="email" required value={customerData.email} onChange={handleCustomerChange}
                  className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${errors.email ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200'} focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-200 outline-none transition-all`}
                  placeholder="john@example.com"
                />
                {errors.email && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.email}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 uppercase ml-1">Password</label>
                <input
                  type="password" name="password" required value={customerData.password} onChange={handleCustomerChange}
                  className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${errors.password ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200'} focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-200 outline-none transition-all`}
                  placeholder="••••••••"
                />
                {errors.password && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.password}</p>}
              </div>

              <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-green-200/50 transition-all transform active:scale-95 mt-6">
                Create Customer Account
              </button>
            </form>
          )}

          {userType === 'shop' && (
            <form onSubmit={handleShopSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase ml-1">Shop Name</label>
                  <input
                    type="text" name="shopName" required value={shopData.shopName} onChange={handleShopChange}
                    className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${errors.shopName ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200'} focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-200 outline-none transition-all`}
                    placeholder="Fresh Mart"
                  />
                  {errors.shopName && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.shopName}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase ml-1">Owner Name</label>
                  <input
                    type="text" name="ownerName" required value={shopData.ownerName} onChange={handleShopChange}
                    className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${errors.ownerName ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200'} focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-200 outline-none transition-all`}
                    placeholder="Jane Smith"
                  />
                  {errors.ownerName && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.ownerName}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 uppercase ml-1">Phone Number</label>
                <input
                  type="tel" name="phone" required value={shopData.phone} onChange={handleShopChange}
                  className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${errors.phone ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200'} focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-200 outline-none transition-all`}
                  placeholder="+1 234 567 890"
                />
                {errors.phone && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.phone}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 uppercase ml-1">Email Address</label>
                <input
                  type="email" name="email" required value={shopData.email} onChange={handleShopChange}
                  className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${errors.email ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200'} focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-200 outline-none transition-all`}
                  placeholder="shop@example.com"
                />
                {errors.email && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.email}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 uppercase ml-1">Password</label>
                <input
                  type="password" name="password" required value={shopData.password} onChange={handleShopChange}
                  className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${errors.password ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200'} focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-200 outline-none transition-all`}
                  placeholder="••••••••"
                />
                {errors.password && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.password}</p>}
              </div>

              <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-green-200/50 transition-all transform active:scale-95 mt-6">
                Register Shop
              </button>
            </form>
          )}

          {userType === 'delivery' && (
            <form onSubmit={handleDeliverySubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase ml-1">Full Name</label>
                  <input
                    type="text" name="name" required value={deliveryData.name} onChange={handleDeliveryChange}
                    className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${errors.name ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200'} focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-200 outline-none transition-all`}
                    placeholder="Delivery Hero"
                  />
                  {errors.name && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.name}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase ml-1">Phone Number</label>
                  <input
                    type="tel" name="phone" required value={deliveryData.phone} onChange={handleDeliveryChange}
                    className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${errors.phone ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200'} focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-200 outline-none transition-all`}
                    placeholder="+91 999 999 9999"
                  />
                  {errors.phone && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.phone}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 uppercase ml-1">Address</label>
                <textarea
                  name="address" required value={deliveryData.address} onChange={handleDeliveryChange} rows="2"
                  className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${errors.address ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200'} focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-200 outline-none transition-all resize-none`}
                  placeholder="Enter your residence address"
                />
                {errors.address && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase ml-1">Vehicle Type</label>
                  <select
                    name="vehicleType" required value={deliveryData.vehicleType} onChange={handleDeliveryChange}
                    className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${errors.vehicleType ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200'} focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-200 outline-none transition-all`}
                  >
                    <option value="">Select Type</option>
                    <option value="Bike">Bike</option>
                    <option value="Scooter">Scooter</option>
                    <option value="Cycle">Cycle</option>
                  </select>
                  {errors.vehicleType && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.vehicleType}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase ml-1">Vehicle Number</label>
                  <input
                    type="text" name="vehicleNumber" required value={deliveryData.vehicleNumber} onChange={handleDeliveryChange}
                    className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${errors.vehicleNumber ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200'} focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-200 outline-none transition-all`}
                    placeholder="KL-01-AB-1234"
                  />
                  {errors.vehicleNumber && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.vehicleNumber}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 uppercase ml-1">Email Address</label>
                <input
                  type="email" name="email" required value={deliveryData.email} onChange={handleDeliveryChange}
                  className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${errors.email ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200'} focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-200 outline-none transition-all`}
                  placeholder="delivery@example.com"
                />
                {errors.email && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.email}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 uppercase ml-1">Password</label>
                <input
                  type="password" name="password" required value={deliveryData.password} onChange={handleDeliveryChange}
                  className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${errors.password ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200'} focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-200 outline-none transition-all`}
                  placeholder="••••••••"
                />
                {errors.password && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.password}</p>}
              </div>

              <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-green-200/50 transition-all transform active:scale-95 mt-6">
                Register as Delivery Boy
              </button>
            </form>
          )}

          {userType === 'farmer' && (
            <form onSubmit={handleFarmerSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase ml-1">Full Name</label>
                  <input
                    type="text" name="name" required value={farmerData.name} onChange={handleFarmerChange}
                    className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${errors.name ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200'} focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-200 outline-none transition-all`}
                    placeholder="Farmer Name"
                  />
                  {errors.name && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.name}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase ml-1">Farm Name</label>
                  <input
                    type="text" name="farmName" required value={farmerData.farmName} onChange={handleFarmerChange}
                    className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${errors.farmName ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200'} focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-200 outline-none transition-all`}
                    placeholder="Green Acres Farm"
                  />
                  {errors.farmName && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.farmName}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 uppercase ml-1">Phone Number</label>
                <input
                  type="tel" name="phone" required value={farmerData.phone} onChange={handleFarmerChange}
                  className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${errors.phone ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200'} focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-200 outline-none transition-all`}
                  placeholder="+91 999 999 9999"
                />
                {errors.phone && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.phone}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 uppercase ml-1">Address</label>
                <textarea
                  name="address" required value={farmerData.address} onChange={handleFarmerChange} rows="2"
                  className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${errors.address ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200'} focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-200 outline-none transition-all resize-none`}
                  placeholder="Enter your farm address"
                />
                {errors.address && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.address}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 uppercase ml-1">Email Address</label>
                <input
                  type="email" name="email" required value={farmerData.email} onChange={handleFarmerChange}
                  className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${errors.email ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200'} focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-200 outline-none transition-all`}
                  placeholder="farmer@example.com"
                />
                {errors.email && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.email}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 uppercase ml-1">Password</label>
                <input
                  type="password" name="password" required value={farmerData.password} onChange={handleFarmerChange}
                  className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${errors.password ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200'} focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-200 outline-none transition-all`}
                  placeholder="••••••••"
                />
                {errors.password && <p className="text-red-500 text-[10px] mt-1 ml-1 font-medium">{errors.password}</p>}
              </div>

              <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-green-200/50 transition-all transform active:scale-95 mt-6">
                Register as Farmer
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account? {' '}
            <Link to="/login" className="text-green-600 font-bold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;


