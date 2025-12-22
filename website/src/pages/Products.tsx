import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Search, SlidersHorizontal, Ruler, ShoppingCart } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import Cart from '../components/Cart';
import SizeRecommender from '../components/ai/SizeRecommender';
import StyleAssistant from '../components/ai/StyleAssistant';
import { fetchProducts } from '../lib/shopify';
import { addToCart, getCartItemCount } from '../lib/cart';
import type { ShopifyProduct } from '../lib/shopify';

declare global {
    interface Window {
        Razorpay: any;
    }
}

const Products = () => {
    const [products, setProducts] = useState<ShopifyProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [sizeRecommenderOpen, setSizeRecommenderOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [cartItemCount, setCartItemCount] = useState(0);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const fetchedProducts = await fetchProducts();
                setProducts(fetchedProducts);
            } catch (error) {
                console.error('Error loading products:', error);
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
        updateCartCount();

        // Listen for cart updates
        const handleCartUpdate = () => updateCartCount();
        window.addEventListener('cartUpdated', handleCartUpdate);
        return () => window.removeEventListener('cartUpdated', handleCartUpdate);
    }, []);

    const updateCartCount = () => {
        setCartItemCount(getCartItemCount());
    };

    const handleAddToCart = (product: ShopifyProduct) => {
        addToCart(product, 1);
        setCartOpen(true);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navigation />

            {/* Hero Section */}
            <section className="py-12 sm:py-16 bg-gradient-to-br from-peach-400 via-peach-300 to-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-6 sm:mb-8">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-xs sm:text-sm font-medium mb-4 sm:mb-6 animate-fadeIn">
                            <Sparkles className="h-4 w-4" />
                            Premium Collection
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-3 sm:mb-4 tracking-tight animate-slideInLeft">
                            Our Products
                        </h1>
                        <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto animate-slideInRight">
                            Discover our curated collection of premium shirts
                        </p>
                    </div>

                    {/* Search and Filter Bar */}
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-xl border border-peach-100 flex flex-col md:flex-row gap-3 sm:gap-4 items-center">
                            <div className="flex-1 relative w-full">
                                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search for your perfect fit..."
                                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 rounded-xl bg-gray-50 border-2 border-transparent focus:border-peach-400 focus:bg-white transition-all duration-300 outline-none text-gray-700 placeholder-gray-400 text-sm sm:text-base"
                                />
                            </div>
                            <button className="w-full md:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white border-2 border-peach-200 hover:border-peach-400 text-peach-700 hover:bg-peach-50 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 justify-center shadow-sm hover:shadow-md text-sm sm:text-base">
                                <SlidersHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
                                Filters
                            </button>
                            <button
                                onClick={() => setSizeRecommenderOpen(true)}
                                className="w-full md:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-peach-400 to-peach-500 text-white rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 justify-center shadow-md hover:shadow-lg text-sm sm:text-base"
                            >
                                <Ruler className="h-4 w-4 sm:h-5 sm:w-5" />
                                Find My Size
                            </button>
                            <button
                                onClick={() => setCartOpen(true)}
                                className="relative w-full md:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white border-2 border-peach-300 hover:border-peach-400 text-peach-700 hover:bg-peach-50 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 justify-center shadow-sm hover:shadow-md text-sm sm:text-base"
                            >
                                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                                Cart
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-peach-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                                        {cartItemCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Products Grid */}
            <section className="py-12 sm:py-16 flex-1">
                <div className="container mx-auto px-4">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                                    <div className="aspect-[3/4] bg-gray-100"></div>
                                    <div className="p-6 space-y-4">
                                        <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {products.map((product, index) => (
                                <Link
                                    key={product.node.id}
                                    to={`/product/${product.node.handle}`}
                                    className="group block animate-fadeIn"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="glass rounded-2xl overflow-hidden border-2 border-white/20 transition-all duration-500 hover:border-peach-300 hover:shadow-2xl hover:-translate-y-2">
                                        <div className="aspect-[3/4] overflow-hidden bg-gray-100 relative">
                                            {product.node.images.edges[0] ? (
                                                <>
                                                    <img
                                                        src={product.node.images.edges[0].node.url}
                                                        alt={product.node.images.edges[0].node.altText || product.node.title}
                                                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                                    {/* Quick Actions Overlay */}
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                                                        <div className="glass px-6 py-3 rounded-full border-2 border-white/30 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                                            <span className="text-white font-semibold flex items-center gap-2">
                                                                <Sparkles className="h-4 w-4" />
                                                                View Details
                                                            </span>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <Sparkles className="h-16 w-16 opacity-20" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-6">
                                            <h3 className="font-bold text-lg mb-2 tracking-tight text-gray-900 group-hover:gradient-text transition-all duration-300">
                                                {product.node.title}
                                            </h3>
                                            <div className="flex items-center justify-between">
                                                <p className="text-xl font-bold text-gray-900">
                                                    {product.node.priceRange.minVariantPrice.currencyCode === 'USD' ? '$' : '₹'}
                                                    {parseFloat(product.node.priceRange.minVariantPrice.amount).toFixed(0)}
                                                </p>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleAddToCart(product);
                                                    }}
                                                    className="px-4 py-2 bg-gradient-to-r from-peach-400 to-peach-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 z-20 relative"
                                                >
                                                    Add to Cart
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="glass rounded-3xl p-16 max-w-md mx-auto">
                                <Sparkles className="h-20 w-20 mx-auto mb-6 text-gray-300" />
                                <p className="text-gray-600 text-xl font-semibold mb-4">No products found</p>
                                <p className="text-gray-500">Check back soon for new arrivals!</p>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Shopping Cart */}
            <Cart isOpen={cartOpen} onClose={() => setCartOpen(false)} />

            {/* AI Components */}
            <SizeRecommender
                isOpen={sizeRecommenderOpen}
                onClose={() => setSizeRecommenderOpen(false)}
            />
            <StyleAssistant />

            <Footer />
        </div>
    );
};

export default Products;
