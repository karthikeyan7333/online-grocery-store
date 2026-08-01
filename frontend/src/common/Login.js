import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5510/grocery/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });
            const data = await response.json();
            if (data.success) {
                // Save user data to localStorage
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('token', data.token);

                setMessage({ type: 'success', text: 'Login successful! Redirecting...' });

                // Redirect based on role
                setTimeout(() => {
                    if (data.user.role === 'customer') {
                        window.location.href = '/';
                    } else if (data.user.role === 'shop') {
                        window.location.href = '/shop';
                    } else if (data.user.role === 'delivery') {
                        window.location.href = '/delivery';
                    } else if (data.user.role === 'admin') {
                        window.location.href = '/admin';
                    } else if (data.user.role === 'farmer') {
                        window.location.href = '/farmer';
                    }
                }, 1500);
            } else {
                setMessage({ type: 'error', text: data.message || 'Login failed' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Server error. Please try again later.' });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-green-100">

                {/* Visual Side Panel */}
                <div className="hidden md:flex md:w-1/2 bg-green-600 p-12 flex-col justify-between text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-4xl font-bold mb-6">Welcome Back!</h2>
                        <p className="text-green-100 text-lg">Great to see you again. Sign in to continue your grocery journey.</p>
                    </div>

                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                            <p className="text-green-50 text-sm">Fresh grogeries at your door</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                            <p className="text-green-50 text-sm">Manage your shop inventory</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-300 rounded-full"></div>
                            <p className="text-green-50 text-sm">Exclusive deals for members</p>
                        </div>
                    </div>

                    <div className="relative z-10">
                        <p className="text-xs text-green-200">© 2026 Online Grocery Inc.</p>
                    </div>

                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-500 rounded-full -mr-32 -mt-32 opacity-20"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400 rounded-full -ml-24 -mb-24 opacity-10"></div>
                </div>

                {/* Form Area */}
                <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center relative">
                    <button
                        onClick={() => navigate('/')}
                        className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-green-600 transition-colors font-semibold text-sm group"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Back to Home
                    </button>
                    <div className="mb-10 text-center md:text-left pt-6">
                        <h1 className="text-3xl font-bold text-gray-800 mb-3">Sign In</h1>
                        <p className="text-gray-500">Enter your credentials to access your account</p>
                    </div>

                    {message.text && (
                        <div className={`mb-6 p-4 rounded-xl text-sm font-semibold ${message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-600 uppercase ml-1">Email Address</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </span>
                                <input
                                    type="email" name="email" required value={loginData.email} onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 outline-none transition-all"
                                    placeholder="yourname@gmail.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-semibold text-gray-600 uppercase">Password</label>
                                <a href="#" className="text-xs font-bold text-green-600 hover:text-green-700 transition-colors">Forgot Password?</a>
                            </div>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </span>
                                <input
                                    type="password" name="password" required value={loginData.password} onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-1">
                            <input type="checkbox" id="remember" className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                            <label htmlFor="remember" className="text-sm text-gray-600">Remember me for 30 days</label>
                        </div>

                        <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl shadow-xl hover:shadow-green-200/50 transition-all transform active:scale-[0.98] mt-4">
                            Log In
                        </button>
                    </form>

                    <p className="mt-10 text-center text-sm text-gray-600">
                        Don't have an account? {' '}
                        <Link to="/register" className="text-green-600 font-bold hover:underline">
                            Create Account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;

