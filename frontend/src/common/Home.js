import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Search, Menu, X, ChevronRight, ChevronLeft, Star, Clock, ShieldCheck, Truck, ArrowRight, Instagram, Facebook, Twitter, Sprout } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import RecommendationModal from '../components/RecommendationModal';

const Home = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [cartCount, setCartCount] = useState(0);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isRecommendationOpen, setIsRecommendationOpen] = useState(false);
    const [addedProductName, setAddedProductName] = useState('');
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        window.location.reload();
    };

    const defaultSlides = [
        {
            title: "Freshness Delivered to Your Doorstep",
            subtitle: "Get up to 30% off on your first order with organic fruits & vegetables.",
            image: "/images/hero1.png",
            buttonText: "Shop Now",
            color: "from-green-600 to-emerald-600"
        },
        {
            title: "Premium Bakery & Dairy Products",
            subtitle: "Baked fresh every morning with 100% natural ingredients.",
            image: "/images/hero2.png",
            buttonText: "View Bakery",
            color: "from-amber-600 to-orange-600"
        },
        {
            title: "Sustainable Eco-Friendly Delivery",
            subtitle: "Sourced locally and delivered with extreme care for quality.",
            image: "/images/hero3.png",
            buttonText: "Explore More",
            color: "from-red-600 to-rose-600"
        }
    ];

    const [offers, setOffers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [subcategories, setSubCategories] = useState([]);
    const [shops, setShops] = useState([]);
    const [farmers, setFarmers] = useState([]);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            fetchCartCount(parsedUser.id || parsedUser._id);
        }

        const fetchData = async () => {
            try {
                // Fetch Categories
                const catRes = await fetch('http://localhost:5510/grocery/categories/getall');
                if (catRes.ok) {
                    const catData = await catRes.json();
                    if (catData.success) setCategories(catData.categories);
                }

                // Fetch Products
                const prodRes = await fetch('http://localhost:5510/grocery/products/getall');
                if (prodRes.ok) {
                    const prodData = await prodRes.json();
                    if (prodData.success) setProducts(prodData.products);
                }

                // Fetch Subcategories
                const subRes = await fetch('http://localhost:5510/grocery/subcategories/getall');
                if (subRes.ok) {
                    const subData = await subRes.json();
                    if (subData.success) setSubCategories(subData.subcategories);
                }

                // Fetch Shops
                const shopRes = await fetch('http://localhost:5510/grocery/shops/getall');
                if (shopRes.ok) {
                    const shopData = await shopRes.json();
                    if (shopData.success) setShops(shopData.shops);
                }

                // Fetch Farmers
                const farmerRes = await fetch('http://localhost:5510/grocery/admin/getfarmers');
                if (farmerRes.ok) {
                    const farmerData = await farmerRes.json();
                    if (farmerData.success) setFarmers(farmerData.farmers.filter(f => f.status === 'Approved'));
                }

                // Fetch Offers for Offers Section
                const offerRes = await fetch('http://localhost:5510/grocery/homepage/offers');
                if (offerRes.ok) {
                    const offerData = await offerRes.json();
                    if (offerData.success) {
                        setOffers(offerData.offers);
                    }
                }

            } catch (error) {
                console.error("Error fetching homepage data:", error);
            }
        };

        fetchData();

        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % defaultSlides.length);
        }, 5000);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearInterval(timer);
        };
    }, []);

    const getDiscountedPrice = (product) => {
        if (!product || !product.price) return 0;

        const prodId = (product._id || product).toString();
        const subcatId = (product.subcategoryid?._id || product.subcategoryid)?.toString();
        const catId = (product.categoryid?._id || product.categoryid)?.toString();

        // Find applicable offer with strict precedence: Product > Subcategory > Category > Global
        const productOffer = offers.find(o => (o.productid?._id || o.productid)?.toString() === prodId);
        const subcatOffer = offers.find(o => (o.subcategoryid?._id || o.subcategoryid)?.toString() === subcatId);
        const catOffer = offers.find(o => (o.categoryid?._id || o.categoryid)?.toString() === catId);
        const globalOffer = offers.find(o => o.isGlobal);

        const applicableOffer = productOffer || subcatOffer || catOffer || globalOffer;

        if (applicableOffer && applicableOffer.discount) {
            const match = applicableOffer.discount.match(/(\d+)%/);
            if (match) {
                const percentage = parseInt(match[1]);
                const discountAmount = (product.price * (percentage / 100));
                return Math.round(product.price - discountAmount);
            }
        }
        return product.price;
    };

    const fetchCartCount = async (userid) => {
        try {
            const res = await fetch(`http://localhost:5510/grocery/cart/get/${userid}`);
            const data = await res.json();
            if (data.success && data.cart) {
                setCartCount(data.cart.products.length);
            }
        } catch (error) {
            console.error("Error fetching cart count:", error);
        }
    };

    const handleAddToCart = async (productId) => {
        if (!user) {
            navigate('/login');
            return;
        }
        try {
            const res = await fetch('http://localhost:5510/grocery/cart/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userid: user.id || user._id, productid: productId, quantity: 1 })
            });
            const data = await res.json();
            if (data.success) {
                // alert("Product added to cart!");
                // Show recommendation modal
                const prod = products.find(p => p._id === productId);
                if (prod) {
                    setAddedProductName(prod.productname);
                    setIsRecommendationOpen(true);
                }

                // Update cart count from the response
                if (data.cart && data.cart.products) {
                    setCartCount(data.cart.products.length);
                }
            } else {
                alert(data.message || "Failed to add to cart");
            }
        } catch (error) {
            console.error("Error adding to cart:", error);
            alert("Error adding to cart");
        }
    };

    return (
        <div id="home" className="min-h-screen bg-white font-sans text-gray-900">
            {/* Navigation */}
            <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-lg shadow-md py-3' : 'bg-transparent py-5'}`}>
                <div className="container mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12">
                            <ShoppingCart className="text-white w-6 h-6" />
                        </div>
                        <span className={`text-2xl font-bold tracking-tight ${!isScrolled && currentSlide === 0 ? 'text-white' : 'text-gray-900'}`}>Grocy<span className="text-green-600">Store</span></span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 font-semibold">
                        {['Home', 'Categories', 'Deals', 'Farmers', 'Stores', 'Contact'].map((item) => (
                            <a key={item} href={`#${item.toLowerCase()}`} className={`hover:text-green-600 transition-colors ${!isScrolled && currentSlide === 0 ? 'text-white/90' : 'text-gray-600'}`}>{item}</a>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <button className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${!isScrolled && currentSlide === 0 ? 'text-white' : 'text-gray-600'}`}>
                            <Search className="w-5 h-5" />
                        </button>

                        {/* Cart Icon Link */}
                        {user && user.role === 'customer' && (
                            <Link to="/cart" className="relative">
                                <button className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${!isScrolled && currentSlide === 0 ? 'text-white' : 'text-gray-600'}`}>
                                    <ShoppingCart className="w-5 h-5" />
                                </button>
                                {cartCount > 0 && (
                                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        )}


                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link to="/order" className={`hidden sm:inline font-bold hover:text-green-600 transition-colors ${!isScrolled && currentSlide === 0 ? 'text-white' : 'text-gray-900'}`}>
                                    My Orders
                                </Link>
                                <span className={`hidden sm:inline font-bold ${!isScrolled && currentSlide === 0 ? 'text-white' : 'text-gray-900'}`}>
                                    Hi, {user.profile?.name || user.email.split('@')[0]}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-red-200 transition-all transform hover:scale-105 active:scale-95"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login">
                                    <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-green-200 transition-all transform hover:scale-105 active:scale-95">
                                        Log In
                                    </button>
                                </Link>
                                <Link to="/register">
                                    <button className={`px-6 py-2.5 rounded-full font-bold transition-all transform hover:scale-105 active:scale-95 border ${!isScrolled && currentSlide === 0 ? 'border-white text-white hover:bg-white/10' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                                        Register
                                    </button>
                                </Link>
                            </div>
                        )}

                        <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X /> : <Menu className={!isScrolled && currentSlide === 0 ? 'text-white' : 'text-gray-600'} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden"
                    >
                        <div className="flex flex-col gap-6 text-xl font-bold">
                            {['Home', 'Shop', 'Categories', 'Deals', 'Stores', 'Contact'].map((item) => (
                                <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setIsMenuOpen(false)}>{item}</a>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero Carousel */}
            <div className="relative h-[90vh] overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0"
                    >
                        <div className="absolute inset-0 bg-black/40 z-10" />
                        <img
                            src={defaultSlides[currentSlide].image}
                            alt="hero"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 z-20 flex items-center">
                            <div className="container mx-auto px-6">
                                <motion.div
                                    initial={{ y: 30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="max-w-2xl text-white"
                                >
                                    <span className="inline-block px-4 py-1.5 rounded-full bg-red-600/30 backdrop-blur-md border border-white/20 text-sm font-bold mb-6 text-green-400">
                                        EXCLUSIVE DEALS
                                    </span>
                                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                                        {defaultSlides[currentSlide].title}
                                    </h1>
                                    <p className="text-xl text-gray-200 mb-10 max-w-lg">
                                        {defaultSlides[currentSlide].subtitle}
                                    </p>
                                    <div className="flex flex-wrap gap-4">
                                        <button
                                            onClick={() => {
                                                if (!user) {
                                                    navigate('/login');
                                                } else {
                                                    // Navigate to shop or appropriate section
                                                    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
                                                }
                                            }}
                                            className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-full font-bold text-lg shadow-2xl transition-all transform hover:translate-y-[-2px]">
                                            {defaultSlides[currentSlide].buttonText}
                                        </button>
                                        <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-10 py-4 rounded-full font-bold text-lg transition-all">
                                            Learn More
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Progress Indicators */}
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-30 flex gap-3">
                    {defaultSlides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={`h-1.5 rounded-full transition-all ${currentSlide === idx ? 'w-10 bg-green-500' : 'w-4 bg-white/50'}`}
                        />
                    ))}
                </div>
            </div>

            {/* Floatings Elements (Decorative) */}
            <div className="relative">
                <motion.div
                    animate={{ y: [0, -20, 0] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="hidden lg:block absolute -top-20 right-10 z-30 bg-white p-4 rounded-2xl shadow-2xl border border-gray-100 max-w-[200px]"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                            ★
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-semibold uppercase">Top Rated</p>
                            <p className="text-sm font-bold">4.9/5 Service</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Exclusive Offers Section */}
            {offers.length > 0 && (
                <section className="py-16 container mx-auto px-6 relative z-40 -mt-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {offers.map((offer) => (
                            <motion.div
                                key={offer._id}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <motion.div
                                    animate={{ y: [0, -15, 0] }}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: Math.random() * 2
                                    }}
                                    className="bg-white rounded-[2rem] shadow-xl overflow-hidden hover:shadow-2xl transition-all group flex flex-col md:flex-row h-full border border-gray-100" // Added more shadow depth
                                >
                                    <div className="w-full md:w-1/2 relative overflow-hidden">
                                        <div className="absolute top-4 left-4 z-10 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                                            {offer.discount}
                                        </div>
                                        <img
                                            src={`http://localhost:5510/offer/${offer.offerImage}`}
                                            alt={offer.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    </div>
                                    <div className="w-full md:w-1/2 p-8 flex flex-col justify-center bg-gradient-to-br from-white to-gray-50">
                                        <h3 className="text-xl font-black text-gray-900 leading-tight mb-3 uppercase tracking-tighter">
                                            {offer.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 font-medium mb-6 line-clamp-3">
                                            {offer.description}
                                        </p>
                                        {offer.productid && (
                                            <div className="flex items-center gap-3 mb-6">
                                                {getDiscountedPrice(offer.productid) < offer.productid?.price && (
                                                    <span className="text-gray-400 line-through font-bold">₹{offer.productid.price}</span>
                                                )}
                                                <span className="text-2xl font-black text-green-600">₹{getDiscountedPrice(offer.productid)}</span>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => {
                                                if (!user) {
                                                    navigate('/login');
                                                    return;
                                                }
                                                if (offer.productid) {
                                                    handleAddToCart(offer.productid._id);
                                                } else if (offer.categoryid) {
                                                    navigate(`/view/category/${offer.categoryid._id || offer.categoryid}`);
                                                } else if (offer.subcategoryid) {
                                                    navigate(`/view/subcategory/${offer.subcategoryid._id || offer.subcategoryid}`);
                                                }
                                            }}
                                            className="w-fit bg-black text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-green-600 transition-colors shadow-lg"
                                        >
                                            Grab Deal
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* Features Bar */}
            <div className="py-12 bg-white mt-[-50px] relative z-30 container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
                            <Truck className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold">Free Delivery</h4>
                            <p className="text-xs text-gray-500">Orders over $50</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 border-l border-gray-100 pl-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold">Safe Payments</h4>
                            <p className="text-xs text-gray-500">100% secure G-Pay</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 border-l border-gray-100 pl-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold">24/7 Support</h4>
                            <p className="text-xs text-gray-500">Always here to help</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 border-l border-gray-100 pl-4">
                        <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600">
                            <Star className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold">Best Quality</h4>
                            <p className="text-xs text-gray-500">Selected providers</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Categories Section */}
            <section id="categories" className="py-24 container mx-auto px-6">
                <div className="text-center mb-16">
                    <span className="text-green-600 font-bold tracking-widest uppercase text-sm">Our Departments</span>
                    <h2 className="text-4xl font-black mt-2">Explore Popular Categories</h2>
                    <p className="text-gray-500 mt-4">Browse through our wide range of product categories.</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
                    {categories.length === 0 ? <p className="col-span-6 text-center text-gray-400">No categories found.</p> : categories.map((cat, idx) => (
                        <motion.div
                            key={cat._id}
                            whileHover={{ y: -10 }}
                            onClick={() => {
                                if (!user) {
                                    navigate('/login');
                                } else {
                                    navigate(`/view/category/${cat._id}`);
                                }
                            }}
                            className="bg-white p-6 rounded-[2rem] flex flex-col items-center text-center cursor-pointer transition-all border border-gray-100 hover:shadow-xl group"
                        >
                            <div className="w-20 h-20 mb-4 rounded-full bg-green-50 flex items-center justify-center overflow-hidden">
                                {cat.categoryimage ? (
                                    <img src={`http://localhost:5510/category/${cat.categoryimage}`} alt={cat.categoryname} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-2xl">🏬</span>
                                )}
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">{cat.categoryname}</h3>
                            <p className="text-xs text-gray-500 line-clamp-1">{cat.description}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Subcategories Section */}
            <section id="subcategories" className="py-12 container mx-auto px-6 bg-gray-50/50 rounded-[3rem] my-12">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-black">Sub Categories</h2>
                </div>
                <div className="flex flex-wrap justify-center gap-6">
                    {subcategories.map((sub) => (
                        <div
                            key={sub._id}
                            onClick={() => {
                                if (!user) {
                                    navigate('/login');
                                } else {
                                    navigate(`/view/subcategory/${sub._id}`);
                                }
                            }}
                            className="flex flex-col items-center gap-2 group cursor-pointer"
                        >
                            <div className="w-24 h-24 rounded-full bg-white border-2 border-green-50 p-1 shadow-lg group-hover:border-green-500 transition-all overflow-hidden">
                                {sub.subcategoryimage ? (
                                    <img src={`http://localhost:5510/subcategory/${sub.subcategoryimage}`} alt={sub.subcategoryname} className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-full">
                                        <span className="text-2xl text-gray-400">📦</span>
                                    </div>
                                )}
                            </div>
                            <span className="font-bold text-sm text-gray-700 group-hover:text-green-600 transition-colors">
                                {sub.subcategoryname}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Shop Section */}
            <section id="shop" className="py-24 container mx-auto px-6">
                <div className="mb-16">
                    <span className="text-green-600 font-bold tracking-widest uppercase text-sm">New Arrivals</span>
                    <h2 className="text-4xl font-black mt-2">Shop Daily Essentials</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.slice(0, 4).map((product, idx) => (
                        <motion.div
                            key={product._id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-gray-100 cursor-pointer"
                            onClick={() => setSelectedProduct(product)}
                        >
                            <div className="relative aspect-square overflow-hidden bg-gray-100">
                                <span className={`absolute top-4 left-4 z-10 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-xl ${product.stockStatus === 'Available' ? 'bg-green-600' : 'bg-red-500'}`}>
                                    {product.stockStatus}
                                </span>
                                <img
                                    src={`http://localhost:5510/product/${product.productimage}`}
                                    alt={product.productname}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                {product.farmerid && (
                                    <div className="absolute bottom-4 left-4 z-10 bg-emerald-600/90 backdrop-blur-sm text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-lg">
                                        <Sprout className="w-3 h-3" /> Farm Fresh
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleAddToCart(product._id); }}
                                    className="absolute bottom-4 right-4 bg-white/90 backdrop-blur text-gray-900 p-3 rounded-2xl shadow-xl transform translate-y-20 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                    <ShoppingCart className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg group-hover:text-green-600 transition-colors uppercase tracking-tighter line-clamp-1">{product.productname}</h3>
                                    <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                                        <Star className="w-4 h-4 fill-current" /> {product.averageRating || '0.0'}
                                        <span className="text-gray-400 text-[10px] font-normal">({product.reviews?.length || 0})</span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-400 mb-2">{product.shopid?.shopName || product.farmerid?.farmName}</p>
                                <p className="text-2xl font-black text-gray-900">₹{product.price}</p>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleAddToCart(product._id); }}
                                    disabled={product.stockStatus !== 'Available'}
                                    className="w-full mt-4 py-3 rounded-2xl bg-gray-50 font-bold text-gray-600 group-hover:bg-green-600 group-hover:text-white transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {product.stockStatus === 'Available' ? 'Add to Cart' : 'Out of Stock'}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Shops Section */}
            <section id="stores" className="py-24 container mx-auto px-6">
                <div className="flex justify-between items-end mb-16">
                    <div>
                        <span className="text-orange-600 font-bold tracking-widest uppercase text-sm">Our Partners</span>
                        <h2 className="text-4xl font-black mt-2">Available Stores</h2>
                        <p className="text-gray-500 mt-2">Shop from your favorite local grocery stores</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {shops.map((shop) => (
                        <div
                            key={shop._id}
                            onClick={() => {
                                if (!user) navigate('/login');
                                else navigate(`/view/shop/${shop._id}`);
                            }}
                            className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 font-black text-2xl group-hover:bg-orange-600 group-hover:text-white transition-all">
                                    {shop.shopName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl group-hover:text-orange-600 transition-colors uppercase tracking-tighter">{shop.shopName}</h3>
                                    <p className="text-sm text-gray-500">Retail Partner</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-widest mt-auto">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    Verified Shop
                                </div>
                                <div className="flex items-center gap-1 text-orange-600 group-hover:translate-x-1 transition-transform">
                                    View Products <ArrowRight className="w-3 h-3" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Farmers Section */}
            <section id="farmers" className="py-24 bg-emerald-50/50">
                <div className="container mx-auto px-6">
                    <div className="flex justify-between items-end mb-16">
                        <div>
                            <span className="text-emerald-600 font-bold tracking-widest uppercase text-sm">Direct Selection</span>
                            <h2 className="text-4xl font-black mt-2">Local Farmers</h2>
                            <p className="text-gray-500 mt-2">Fresh produce delivered directly from the farm to you</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {farmers.map((farmer) => (
                            <div
                                key={farmer._id}
                                onClick={() => {
                                    if (!user) navigate('/login');
                                    else navigate(`/view/farmer/${farmer._id}`);
                                }}
                                className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 font-black text-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                        <Sprout className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl group-hover:text-emerald-600 transition-colors uppercase tracking-tighter">{farmer.farmName}</h3>
                                        <p className="text-sm text-gray-500">{farmer.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-widest mt-auto">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                        Direct from Farm
                                    </div>
                                    <div className="flex items-center gap-1 text-emerald-600 group-hover:translate-x-1 transition-transform">
                                        Explore Harvest <ArrowRight className="w-3 h-3" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Deals (Products) */}
            <section id="deals" className="py-24 bg-gray-50 overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div>
                            <span className="text-red-600 font-bold tracking-widest uppercase text-sm">Don't Miss</span>
                            <h2 className="text-4xl font-black mt-2">Today's Featured Deals</h2>
                        </div>
                        <button
                            onClick={() => {
                                if (!user) {
                                    navigate('/login');
                                } else {
                                    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
                                }
                            }}
                            className="flex items-center gap-2 text-green-600 font-bold hover:text-green-700 transition-colors">
                            View all items <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.filter(p => getDiscountedPrice(p) < p.price).length === 0 ? (
                            <p className="col-span-4 text-center text-gray-400 font-medium py-12">No active deals found at the moment. Check back soon!</p>
                        ) : (
                            products.filter(p => getDiscountedPrice(p) < p.price).map((product, idx) => (
                                <motion.div
                                    key={product._id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-gray-100 cursor-pointer"
                                    onClick={() => setSelectedProduct(product)}
                                >
                                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                                        <span className={`absolute top-4 left-4 z-10 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-xl ${product.stockStatus === 'Available' ? 'bg-green-600' : 'bg-red-500'}`}>
                                            {product.stockStatus}
                                        </span>
                                        <img
                                            src={`http://localhost:5510/product/${product.productimage}`}
                                            alt={product.productname}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleAddToCart(product._id); }}
                                            className="absolute bottom-4 right-4 bg-white/90 backdrop-blur text-gray-900 p-3 rounded-2xl shadow-xl transform translate-y-20 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                            <ShoppingCart className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg group-hover:text-green-600 transition-colors uppercase tracking-tighter line-clamp-1">{product.productname}</h3>
                                            <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                                                <Star className="w-4 h-4 fill-current" /> {product.averageRating || '0.0'}
                                                <span className="text-gray-400 text-[10px] font-normal">({product.reviews?.length || 0})</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-400 mb-2">{product.shopid?.shopName}</p>
                                        <div className="flex items-center gap-3">
                                            {getDiscountedPrice(product) < product.price && (
                                                <span className="text-sm text-gray-400 line-through font-bold">₹{product.price}</span>
                                            )}
                                            <p className="text-2xl font-black text-gray-900">₹{getDiscountedPrice(product)}</p>
                                        </div>
                                        <button
                                            onClick={() => handleAddToCart(product._id)}
                                            disabled={product.stockStatus !== 'Available'}
                                            className="w-full mt-4 py-3 rounded-2xl bg-gray-50 font-bold text-gray-600 group-hover:bg-green-600 group-hover:text-white transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                                            {product.stockStatus === 'Available' ? 'Add to Cart' : 'Out of Stock'}
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </section >

            {/* Big Promo Section */}
            < section className="py-24" >
                <div className="container mx-auto px-6">
                    <div className="bg-green-600 rounded-[3rem] p-12 md:p-24 relative overflow-hidden flex flex-col md:flex-row items-center justify-between">
                        <div className="relative z-10 text-white max-w-xl">
                            <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">Join Our Fresh Rewards Program Today!</h2>
                            <p className="text-xl text-green-100 mb-10">Get instant access to free delivery, exclusive deals, and surprise gifts every month.</p>
                            <div className="flex gap-4">
                                <Link to="/register">
                                    <button className="bg-white text-green-600 px-10 py-5 rounded-full font-black text-lg shadow-2xl hover:bg-green-50 transition-all">Sign Up Free</button>
                                </Link>
                                <button className="border-2 border-white/30 px-10 py-5 rounded-full font-black text-lg text-white hover:bg-white/10 transition-all">Learn More</button>
                            </div>
                        </div>

                        {/* Floating elements inside promo */}
                        <div className="hidden lg:block relative w-[400px] h-[400px]">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                                className="absolute inset-0 rounded-full border-2 border-dashed border-white/20"
                            />
                            <motion.div
                                animate={{ y: [0, -30, 0] }}
                                transition={{ repeat: Infinity, duration: 6 }}
                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl p-6 shadow-2xl w-64"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-full" />
                                    <div className="h-4 w-24 bg-gray-100 rounded-full" />
                                </div>
                                <div className="space-y-3">
                                    <div className="h-3 w-full bg-gray-50 rounded-full" />
                                    <div className="h-3 w-4/5 bg-gray-50 rounded-full" />
                                    <div className="h-10 w-full bg-green-500 rounded-xl" />
                                </div>
                            </motion.div>
                        </div>

                        <div className="absolute top-0 right-0 w-96 h-96 bg-green-500 rounded-full transform translate-x-1/3 -translate-y-1/3" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-700 rounded-full transform -translate-x-1/3 translate-y-1/3" />
                    </div>
                </div>
            </section >

            {/* Footer */}
            < footer id="contact" className="bg-gray-950 text-white py-24 px-6 border-t border-gray-900" >
                <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                                <ShoppingCart className="text-white w-6 h-6" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight">Grocy<span className="text-green-600">Store</span></span>
                        </div>
                        <p className="text-gray-400 leading-relaxed font-medium">Sustainable, fresh, and local groceries delivered to your door with love and care for the planet.</p>
                        <div className="flex gap-4">
                            {[Instagram, Facebook, Twitter].map((Icon, idx) => (
                                <a key={idx} href="#" className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center hover:bg-green-600 transition-all border border-gray-800">
                                    <Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-lg font-bold mb-8">Quick Links</h4>
                        <ul className="space-y-4 text-gray-400 font-medium">
                            {['About Us', 'Contact', 'Store Locator', 'Mobile App', 'Career'].map((item) => (
                                <li key={item}><a href="#" className="hover:text-green-500 transition-colors">{item}</a></li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-bold mb-8">Customer Service</h4>
                        <ul className="space-y-4 text-gray-400 font-medium">
                            {['Help Center', 'Track Order', 'Return Policy', 'Gift Cards', 'Bulk Orders'].map((item) => (
                                <li key={item}><a href="#" className="hover:text-green-500 transition-colors">{item}</a></li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-bold mb-8">Subscribe to Newsletter</h4>
                        <p className="text-gray-400 mb-6 font-medium">Receive the latest updates, deals and exclusive offers directly in your inbox.</p>
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="Enter email address"
                                className="w-full bg-gray-900 border border-gray-800 rounded-full py-4 px-6 pr-32 outline-none focus:border-green-600 transition-all"
                            />
                            <button className="absolute right-2 top-2 bottom-2 bg-green-600 hover:bg-green-700 px-6 rounded-full font-bold transition-all transform active:scale-95">
                                Join
                            </button>
                        </div>
                    </div>
                </div>
                <div className="container mx-auto mt-24 pt-8 border-t border-gray-900 text-center text-gray-500 text-sm font-bold tracking-widest uppercase">
                    © 2026 GrocyStore. Built with Premium Quality.
                </div>
            </footer >

            {/* Product Details & Reviews Modal */}
            < AnimatePresence >
                {selectedProduct && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row relative"
                        >
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="absolute top-6 right-6 z-10 p-2 bg-white/80 backdrop-blur rounded-full shadow-lg hover:bg-gray-100 transition-all"
                            >
                                <X className="w-6 h-6 text-gray-900" />
                            </button>

                            {/* Left: Product Image */}
                            <div className="w-full md:w-1/2 bg-gray-50 flex items-center justify-center p-12">
                                <img
                                    src={`http://localhost:5510/product/${selectedProduct.productimage}`}
                                    alt={selectedProduct.productname}
                                    className="w-full h-auto object-contain rounded-3xl mix-blend-multiply"
                                />
                            </div>

                            {/* Right: Info & Reviews */}
                            <div className="w-full md:w-1/2 p-12 overflow-y-auto flex flex-col">
                                <div className="mb-8">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-200">
                                            {selectedProduct.categoryname}
                                        </span>
                                        <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                                            <Star className="w-4 h-4 fill-current" /> {selectedProduct.averageRating || '0.0'}
                                            <span className="text-gray-400 font-normal">({selectedProduct.reviews?.length || 0})</span>
                                        </div>
                                    </div>
                                    <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter mb-4">{selectedProduct.productname}</h2>
                                    <p className="text-gray-500 font-medium leading-relaxed mb-6">{selectedProduct.description}</p>
                                    <div className="flex items-center gap-4">
                                        <p className="text-4xl font-black text-gray-900">₹{getDiscountedPrice(selectedProduct)}</p>
                                        {getDiscountedPrice(selectedProduct) < selectedProduct.price && (
                                            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-black italic">
                                                SAVE ₹{selectedProduct.price - getDiscountedPrice(selectedProduct)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Reviews Section */}
                                <div className="border-t border-gray-100 pt-8 mt-auto">
                                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest mb-6">Customer Reviews</h3>

                                    <div className="space-y-6">
                                        {selectedProduct.reviews?.length === 0 ? (
                                            <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                                <p className="text-gray-400 font-bold italic">No reviews yet for this product.</p>
                                            </div>
                                        ) : (
                                            selectedProduct.reviews.map((rev, i) => (
                                                <div key={i} className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <p className="font-black text-gray-900 text-sm mb-1 uppercase tracking-tight">
                                                                {rev.userid?.regid?.name || 'Verified Customer'}
                                                            </p>
                                                            <div className="flex gap-1">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                            {new Date(rev.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 font-medium italic">"{rev.comment}"</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleAddToCart(selectedProduct._id)}
                                    disabled={selectedProduct.stockStatus !== 'Available'}
                                    className="w-full mt-12 py-5 rounded-2xl bg-green-600 text-white font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-green-200 hover:bg-green-700 transition-all transform active:scale-95 disabled:opacity-50"
                                >
                                    {selectedProduct.stockStatus === 'Available' ? 'Quick Add to Cart' : 'Currently Out of Stock'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence >
            <RecommendationModal
                isOpen={isRecommendationOpen}
                onClose={() => setIsRecommendationOpen(false)}
                productName={addedProductName}
                handleAddToCart={handleAddToCart}
            />
        </div >
    );
};

export default Home;
