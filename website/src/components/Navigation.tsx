import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Menu, X, Search, User, ShoppingBag } from 'lucide-react';
import { useState } from 'react';

const Navigation = () => {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    const mainLinks = [
        { path: '/', label: 'Home' },
        { path: '/products', label: 'Products' },
        { path: '/about', label: 'About' },
    ];

    const quickLinks = [
        { path: '/virtual-tryon', label: 'Virtual Try-On', icon: Sparkles },
        { path: '/track-order', label: 'Track Order' },
    ];

    return (
        <nav className="sticky top-0 z-50 glass border-b border-white/20 shadow-soft">
            {/* Top Bar - Quick Links (Desktop Only) */}
            <div className="hidden lg:block bg-gradient-to-r from-peach-50 to-white border-b border-peach-100">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-end gap-6 h-10 text-sm">
                        {quickLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className="flex items-center gap-1.5 text-gray-700 hover:text-peach-600 transition-colors font-medium"
                            >
                                {link.icon && <link.icon className="h-4 w-4" />}
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Navigation */}
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Mobile Menu Button - Left */}
                    <button
                        className="lg:hidden p-2 -ml-2 rounded-md text-gray-700 hover:bg-white/50 transition-colors touch-manipulation"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>

                    {/* Logo - Center on mobile, Left on desktop */}
                    <Link to="/" className="flex items-center gap-2 group lg:mr-8" onClick={() => setMobileMenuOpen(false)}>
                        <span className="text-2xl md:text-3xl font-bold tracking-tighter gradient-text">
                            VERSE
                        </span>
                    </Link>

                    {/* Desktop Navigation Links - Center */}
                    <div className="hidden lg:flex items-center gap-1 xl:gap-2 flex-1">
                        {mainLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-4 xl:px-5 py-2.5 rounded-md text-sm font-medium uppercase tracking-wide transition-all duration-300 ${isActive(link.path)
                                    ? 'bg-gradient-to-r from-peach-400 to-peach-600 text-white shadow-md'
                                    : 'text-gray-700 hover:bg-white/50 hover:text-gray-900'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right Side Icons */}
                    <div className="flex items-center gap-1 md:gap-3">
                        {/* Search Bar - Desktop */}
                        <div className="hidden md:flex items-center">
                            {searchOpen ? (
                                <div className="flex items-center gap-2 animate-fadeIn">
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        className="px-4 py-2 rounded-md border border-gray-300 focus:border-peach-400 focus:outline-none focus:ring-2 focus:ring-peach-200 w-48 lg:w-64 text-sm"
                                        autoFocus
                                    />
                                    <button
                                        onClick={() => setSearchOpen(false)}
                                        className="p-2 rounded-md text-gray-700 hover:bg-white/50 transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setSearchOpen(true)}
                                    className="p-2 rounded-md text-gray-700 hover:bg-white/50 transition-colors touch-manipulation"
                                    aria-label="Search"
                                >
                                    <Search className="h-5 w-5" />
                                </button>
                            )}
                        </div>

                        {/* User Account Icon */}
                        <Link
                            to="/login"
                            className="p-2 rounded-md text-gray-700 hover:bg-white/50 transition-colors hidden md:block touch-manipulation"
                            aria-label="Account"
                        >
                            <User className="h-5 w-5" />
                        </Link>

                        {/* Shopping Cart Icon */}
                        <Link
                            to="/checkout"
                            className="p-2 -mr-2 rounded-md text-gray-700 hover:bg-white/50 transition-colors relative touch-manipulation"
                            aria-label="Shopping Cart"
                        >
                            <ShoppingBag className="h-5 w-5 md:h-6 md:w-6" />
                            {/* Cart badge - you can make this dynamic */}
                            <span className="absolute -top-1 -right-1 bg-peach-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                0
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden py-4 border-t border-white/20 animate-fadeIn">
                        {/* Mobile Search */}
                        <div className="mb-4 px-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    className="w-full pl-11 pr-4 py-3 rounded-md border-2 border-gray-300 focus:border-peach-400 focus:outline-none focus:ring-2 focus:ring-peach-200 text-base touch-manipulation"
                                />
                            </div>
                        </div>

                        {/* Mobile Navigation Links */}
                        <div className="flex flex-col gap-2 px-2">
                            {/* Main Links */}
                            {mainLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`px-4 py-3.5 rounded-md text-base font-medium uppercase tracking-wide transition-all duration-300 touch-manipulation ${isActive(link.path)
                                        ? 'bg-gradient-to-r from-peach-400 to-peach-600 text-white shadow-md'
                                        : 'text-gray-700 hover:bg-white/50 hover:text-gray-900'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}

                            {/* Divider */}
                            <div className="h-px bg-gray-200 my-2"></div>

                            {/* Quick Links */}
                            <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold px-4 py-2">
                                Quick Links
                            </div>
                            {quickLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="px-4 py-3.5 rounded-md text-base font-medium transition-all duration-300 text-gray-700 hover:bg-white/50 hover:text-gray-900 flex items-center gap-2 touch-manipulation"
                                >
                                    {link.icon && <link.icon className="h-5 w-5" />}
                                    {link.label}
                                </Link>
                            ))}

                            {/* Mobile Account Link */}
                            <Link
                                to="/login"
                                onClick={() => setMobileMenuOpen(false)}
                                className="px-4 py-3.5 rounded-md text-base font-medium transition-all duration-300 text-gray-700 hover:bg-white/50 hover:text-gray-900 flex items-center gap-2 touch-manipulation"
                            >
                                <User className="h-5 w-5" />
                                Account
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navigation;
