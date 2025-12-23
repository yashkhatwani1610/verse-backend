import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { fetchProducts } from '../lib/shopify';
import type { ShopifyProduct } from '../lib/shopify';

const Index = () => {
    const [featuredProducts, setFeaturedProducts] = useState<ShopifyProduct[]>([]);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const products = await fetchProducts(3);
                setFeaturedProducts(products);
            } catch (error) {
                console.error('Error loading featured products:', error);
            }
        };
        loadProducts();
    }, []);

    return (
        <div className="min-h-screen flex flex-col">
            <Navigation />

            {/* Hero Banner - Full Width Minimalist Design with Peach Gradient */}
            <section className="relative h-[70vh] sm:h-[80vh] md:h-[85vh] min-h-[500px] sm:min-h-[600px] max-h-[900px] bg-gradient-to-br from-peach-400 via-peach-300 to-white">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=2070')] bg-cover bg-center opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent"></div>

                <div className="relative z-20 h-full flex items-center justify-center">
                    <div className="text-center px-6 sm:px-12 max-w-4xl mx-auto">
                        <h1 className="text-6xl sm:text-7xl md:text-9xl font-bold mb-6 sm:mb-8 tracking-tighter text-gray-900">
                            VERSE
                        </h1>
                        <p className="text-2xl sm:text-3xl md:text-4xl font-light italic mb-8 sm:mb-12 tracking-[0.15em] sm:tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-gray-700 via-peach-600 to-gray-700 drop-shadow-sm">
                            Freedom in Fashion
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/products">
                                <Button size="lg" className="px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg w-full sm:w-auto">
                                    Shop Now <ArrowRight className="h-5 w-5 ml-2" />
                                </Button>
                            </Link>
                            <Link to="/virtual-tryon">
                                <Button variant="outline" size="lg" className="px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg w-full sm:w-auto">
                                    <Sparkles className="h-5 w-5 mr-2" /> Virtual Try-On
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>


            {/* Featured Products Grid */}
            <section className="py-12 sm:py-16 md:py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="mb-12 sm:mb-16 text-center max-w-3xl mx-auto">
                        <span className="text-xs sm:text-sm font-bold tracking-[0.25em] sm:tracking-[0.3em] text-peach-600 mb-2 sm:mb-3 block uppercase">Curated For You</span>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 sm:mb-6 text-gray-900">Featured Collection</h2>
                        <div className="h-1 w-20 sm:w-24 bg-gradient-to-r from-peach-400 to-peach-600 mx-auto"></div>
                    </div>

                    {featuredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                            {featuredProducts.map((product, index) => (
                                <Link
                                    key={product.node.id}
                                    to={`/product/${product.node.handle}`}
                                    className="group block animate-fadeIn"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                                        <div className="aspect-[3/4] overflow-hidden bg-gray-50 relative">
                                            {product.node.images.edges[0] ? (
                                                <>
                                                    <img
                                                        src={product.node.images.edges[0].node.url}
                                                        alt={product.node.images.edges[0].node.altText || product.node.title}
                                                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-peach-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    No image
                                                </div>
                                            )}

                                            {/* Quick View Overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                                                <div className="bg-white px-6 py-3 rounded-md border border-peach-300 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                                    <span className="text-peach-700 font-semibold uppercase text-sm tracking-wide">View Details</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            <h3 className="font-semibold text-base mb-2 text-gray-900 uppercase tracking-wide">
                                                {product.node.title}
                                            </h3>
                                            <p className="text-lg font-bold text-gray-900">
                                                {product.node.priceRange.minVariantPrice.currencyCode === 'USD' ? '$' : '₹'}
                                                {parseFloat(product.node.priceRange.minVariantPrice.amount).toFixed(0)}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-gray-600 text-lg mb-6">No products found</p>
                            <p className="text-sm text-gray-500">Create your first product to get started</p>
                        </div>
                    )}

                    {featuredProducts.length > 0 && (
                        <div className="text-center mt-16">
                            <Link to="/products">
                                <Button variant="outline" size="lg" className="border-2">
                                    View All Products
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Brand Philosophy Section */}
            <section className="py-12 sm:py-16 md:py-24 bg-gradient-to-br from-peach-50 via-white to-peach-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center md:text-left">
                            <p className="text-xs sm:text-sm tracking-[0.25em] sm:tracking-[0.3em] text-peach-600 mb-3 sm:mb-4 uppercase font-medium">About Verse</p>
                            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 sm:mb-6 tracking-tight leading-tight text-gray-900">
                                Every Shirt<br />A Verse
                            </h2>
                            <div className="h-1 w-12 sm:w-16 bg-gradient-to-r from-peach-400 to-peach-600 mb-4 sm:mb-6 mx-auto md:mx-0"></div>
                            <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed mb-4 sm:mb-6">
                                At Verse, we believe in creating shirts that transcend trends. Each piece is thoughtfully
                                designed with premium materials and meticulous attention to detail.
                            </p>
                            <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6 sm:mb-8">
                                From classic whites to bold patterns, every shirt tells its own story. Quality that lasts,
                                style that speaks.
                            </p>
                            <Link to="/about">
                                <Button variant="outline" className="w-full sm:w-auto">
                                    Read Our Story <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>



            <Footer />
        </div>
    );
};

export default Index;
