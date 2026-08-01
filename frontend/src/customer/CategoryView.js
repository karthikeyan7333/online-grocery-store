import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ArrowLeft, Star, X, Sprout } from 'lucide-react';
import RecommendationModal from '../components/RecommendationModal';

const CategoryView = () => {
    const { type, id } = useParams(); // type can be 'category' or 'subcategory'
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState(null);
    const [subcategory, setSubcategory] = useState(null);
    const [shop, setShop] = useState(null);
    const [farmer, setFarmer] = useState(null);
    const [subcategories, setSubcategories] = useState([]);
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user] = useState(JSON.parse(localStorage.getItem('user')));
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isRecommendationOpen, setIsRecommendationOpen] = useState(false);
    const [addedProductName, setAddedProductName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Offers
                const offerRes = await fetch('http://localhost:5510/grocery/homepage/offers');
                if (offerRes.ok) {
                    const offerData = await offerRes.json();
                    if (offerData.success) setOffers(offerData.offers);
                }

                const typeLower = type?.toLowerCase();
                const targetId = String(id || '').trim();

                if (typeLower === 'category') {
                    // Fetch Category Details
                    const catRes = await fetch(`http://localhost:5510/grocery/categories/getall`);
                    if (catRes.ok) {
                        const catData = await catRes.json();
                        if (catData.success) {
                            const currentCat = catData.categories.find(c => {
                                const cId = String(c._id || c).trim();
                                return cId === targetId;
                            });
                            setCategory(currentCat);
                        }
                    }

                    // Fetch Subcategories for this category
                    const subcatRes = await fetch(`http://localhost:5510/grocery/subcategories/getall`);
                    if (subcatRes.ok) {
                        const subcatData = await subcatRes.json();
                        if (subcatData.success) {
                            setSubcategories(subcatData.subcategories.filter(s => {
                                const sCatId = String(s.categoryid?._id || s.categoryid || '').trim();
                                return sCatId === targetId;
                            }));
                        }
                    }
                } else if (typeLower === 'subcategory') {
                    // Fetch Subcategory Details
                    const subcatRes = await fetch(`http://localhost:5510/grocery/subcategories/getall`);
                    if (subcatRes.ok) {
                        const subcatData = await subcatRes.json();
                        if (subcatData.success) {
                            const currentSub = subcatData.subcategories.find(s => {
                                const sId = String(s._id || s).trim();
                                return sId === targetId;
                            });
                            setSubcategory(currentSub);
                        }
                    }
                } else if (typeLower === 'shop') {
                    // Fetch Shop Details
                    const shopRes = await fetch(`http://localhost:5510/grocery/shops/getall`);
                    if (shopRes.ok) {
                        const shopData = await shopRes.json();
                        if (shopData.success) {
                            const currentShop = shopData.shops.find(s => {
                                const sId = String(s._id || s).trim();
                                return sId === targetId;
                            });
                            setShop(currentShop);
                        }
                    }
                } else if (typeLower === 'farmer') {
                    // Fetch Farmer Details
                    const farmerRes = await fetch(`http://localhost:5510/grocery/admin/getfarmers`);
                    if (farmerRes.ok) {
                        const farmerData = await farmerRes.json();
                        if (farmerData.success) {
                            const currentFarmer = farmerData.farmers.find(f => {
                                const fId = String(f._id || f).trim();
                                return fId === targetId;
                            });
                            setFarmer(currentFarmer);
                        }
                    }
                }

                // Fetch Products
                const prodRes = await fetch('http://localhost:5510/grocery/products/getall');
                if (prodRes.ok) {
                    const prodData = await prodRes.json();
                    if (prodData.success) {
                        let filteredProducts = [];
                        if (typeLower === 'category') {
                            filteredProducts = prodData.products.filter(p => {
                                const pCatId = String(p.categoryid?._id || p.categoryid || '').trim();
                                return pCatId === targetId;
                            });
                        } else if (typeLower === 'subcategory') {
                            filteredProducts = prodData.products.filter(p => {
                                const pSubCatId = String(p.subcategoryid?._id || p.subcategoryid || '').trim();
                                return pSubCatId === targetId;
                            });
                        } else if (typeLower === 'shop') {
                            filteredProducts = prodData.products.filter(p => {
                                const pShopId = String(p.shopid?._id || p.shopid || '').trim();
                                return pShopId === targetId;
                            });
                        } else if (typeLower === 'farmer') {
                            filteredProducts = prodData.products.filter(p => {
                                const pFarmerId = String(p.farmerid?._id || p.farmerid || '').trim();
                                return pFarmerId === targetId;
                            });
                        }
                        setProducts(filteredProducts);
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [type, id]);

    const getDiscountedPrice = (product) => {
        if (!product || !product.price) return 0;

        const prodId = (product._id || product).toString();
        const subcatId = (product.subcategoryid?._id || product.subcategoryid)?.toString();
        const catId = (product.categoryid?._id || product.categoryid)?.toString();

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
                const prod = products.find(p => p._id === productId);
                if (prod) {
                    setAddedProductName(prod.productname);
                    setIsRecommendationOpen(true);
                }
            } else {
                alert(data.message || "Failed to add to cart");
            }
        } catch (error) {
            console.error("Error adding to cart:", error);
            alert("Error adding to cart");
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        </div>
    );

    const title = type === 'category' ? category?.categoryname :
        type === 'subcategory' ? subcategory?.subcategoryname :
            type === 'shop' ? shop?.shopName :
                type === 'farmer' ? farmer?.farmName : 'Products';

    const description = type === 'category' ? category?.description :
        type === 'shop' ? `Managed by ${shop?.ownerName}` :
            type === 'farmer' ? `Harvested by ${farmer?.name}` : 'Explore our quality products';

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-6 sticky top-0 z-10">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black uppercase tracking-tighter text-gray-900">{title}</h1>
                            <p className="text-sm text-gray-500 font-bold">{description || 'Explore our quality products'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-12">
                {/* Subcategories (if Category) */}
                {type === 'category' && subcategories.length > 0 && (
                    <div className="mb-16">
                        <h2 className="text-xl font-black mb-8 uppercase tracking-widest text-gray-400">Sub Categories</h2>
                        <div className="flex flex-wrap gap-6">
                            {subcategories.map((sub) => (
                                <Link
                                    key={sub._id}
                                    to={`/view/subcategory/${sub._id}`}
                                    className="flex flex-col items-center gap-3 group"
                                >
                                    <div className="w-24 h-24 rounded-full bg-white border-2 border-gray-100 p-1 shadow-md group-hover:border-green-500 transition-all overflow-hidden">
                                        {sub.subcategoryimage ? (
                                            <img src={`http://localhost:5510/subcategory/${sub.subcategoryimage}`} alt={sub.subcategoryname} className="w-full h-full object-cover rounded-full" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-full text-2xl">📦</div>
                                        )}
                                    </div>
                                    <span className="font-bold text-sm text-gray-700 group-hover:text-green-600 transition-colors">{sub.subcategoryname}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Products */}
                <div>
                    <h2 className="text-xl font-black mb-8 uppercase tracking-widest text-gray-400">
                        {products.length} {products.length === 1 ? 'Product' : 'Products'} Available
                    </h2>

                    {products.length === 0 ? (
                        <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100 shadow-sm">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">🛒</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                            <p className="text-gray-500">We're working on adding more items to this category.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {products.map((product, idx) => (
                                <motion.div
                                    key={product._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-gray-100 cursor-pointer"
                                    onClick={() => setSelectedProduct(product)}
                                >
                                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                                        {getDiscountedPrice(product) < product.price && (
                                            <span className="absolute top-4 left-4 z-10 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-xl">
                                                OFFER
                                            </span>
                                        )}
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

                                        <div className="flex items-center gap-3">
                                            {getDiscountedPrice(product) < product.price && (
                                                <span className="text-sm text-gray-400 line-through font-bold">₹{product.price}</span>
                                            )}
                                            <p className="text-2xl font-black text-gray-900">₹{getDiscountedPrice(product)}</p>
                                        </div>

                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleAddToCart(product._id); }}
                                            disabled={product.stockStatus !== 'Available'}
                                            className="w-full mt-4 py-3 rounded-2xl bg-gray-50 font-bold text-gray-600 group-hover:bg-green-600 group-hover:text-white transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                            <ShoppingCart className="w-4 h-4" />
                                            {product.stockStatus === 'Available' ? 'Add to Cart' : 'Out of Stock'}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Product Details & Reviews Modal */}
            <AnimatePresence>
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
                                        {selectedProduct.farmerid && (
                                            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200 flex items-center gap-1">
                                                <Sprout className="w-3 h-3" /> {selectedProduct.farmerid.farmName}
                                            </span>
                                        )}
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
            </AnimatePresence>

            <RecommendationModal
                isOpen={isRecommendationOpen}
                onClose={() => setIsRecommendationOpen(false)}
                productName={addedProductName}
                handleAddToCart={handleAddToCart}
            />
        </div>
    );
};

export default CategoryView;
