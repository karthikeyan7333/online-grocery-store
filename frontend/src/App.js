import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './common/Register';
import Login from './common/Login';
import Home from './common/Home';
import ShopDashboard from './shop/ShopDashboard';
import AddProduct from './shop/AddProduct';
import EditProduct from './shop/EditProduct';
import AddCategory from './admin/AddCategory';
import AddSubCategory from './admin/AddSubCategory';
import { useState, useEffect } from 'react';
import Cart from './customer/Cart';
import Order from './customer/Order';
import AdminDashboard from './admin/AdminDashboard';
import EditCategory from './admin/EditCategory';
import EditSubCategory from './admin/EditSubCategory';
import AddOffer from './admin/AddOffer';

import Payment from './customer/Payment';

import DeliveryDashboard from './delivery/Dashboard';

import CategoryView from './customer/CategoryView';
import FarmerDashboard from './farmer/FarmerDashboard';

import AddFarmerProduct from './farmer/AddFarmerProduct';
import ChatBot from './components/ChatBot';

function App() {
  const [auth, setAuth] = useState(JSON.parse(localStorage.getItem("user")));

  useEffect(() => {
    const syncAuth = () => {
      setAuth(JSON.parse(localStorage.getItem("user")));
    };

    window.addEventListener('storage', syncAuth);
    window.addEventListener('auth-change', syncAuth);

    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('auth-change', syncAuth);
    };
  }, []);

  // Helper to safely get role
  const role = auth?.role || auth?.usertype;

  return (
    <>
      <BrowserRouter>
        {auth == null ? (
          <>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path='/login' element={<Login />} />
              <Route path="/view/:type/:id" element={<CategoryView />} />
            </Routes>

            <ChatBot />
          </>

        ) : role === "customer" ? (
          <>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/cart' element={<Cart />} />
              <Route path='/order' element={<Order />} />
              <Route path='/payment' element={<Payment />} />
              <Route path="/view/:type/:id" element={<CategoryView />} />
            </Routes>

            <ChatBot />
          </>
        ) : role === "shop" ? (
          <>
            <Routes>
              <Route path='/' element={<ShopDashboard />} />

              <Route path='/shop' element={<ShopDashboard />} />
              <Route path='/shop/addproduct' element={<AddProduct />} />
              <Route path='/shop/editproduct' element={<EditProduct />} />
            </Routes>
          </>
        ) : role === "delivery" ? (
          <>
            <Routes>
              <Route path='/' element={<DeliveryDashboard />} />
              <Route path='/delivery' element={<DeliveryDashboard />} />
            </Routes>
          </>
        ) : role === "farmer" ? (
          <>
            <Routes>
              <Route path='/' element={<FarmerDashboard />} />
              <Route path='/farmer' element={<FarmerDashboard />} />
              <Route path='/farmer/addproduct' element={<AddFarmerProduct />} />
            </Routes>
          </>
        ) : role === "admin" ? (
          <>
            <Routes>
              <Route path='/' element={<AdminDashboard />} />

              <Route path='/admin' element={<AdminDashboard />} />
              <Route path='/admin/addcategory' element={<AddCategory />} />
              <Route path='/admin/editcategory' element={<EditCategory />} />
              <Route path='/admin/addsubcategory' element={<AddSubCategory />} />
              <Route path='/admin/editsubcategory' element={<EditSubCategory />} />
              <Route path='/admin/addoffer' element={<AddOffer />} />
            </Routes>
          </>
        ) : null
        }
      </BrowserRouter >
    </>
  );
}

export default App;
