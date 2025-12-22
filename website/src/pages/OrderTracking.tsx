import { useState } from 'react';
import { Search, Package, Truck, CheckCircle, Clock, MapPin, Sparkles } from 'lucide-react';
import { trackOrder, type OrderTrackingResult } from '../lib/gemini';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const OrderTracking = () => {
    const [orderId, setOrderId] = useState('');
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<OrderTrackingResult | null>(null);

    const handleTrackOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderId.trim() && !phone.trim()) return;

        setIsLoading(true);
        setResult(null);

        try {
            const trackingResult = await trackOrder(orderId, phone);
            setResult(trackingResult);
        } catch (error) {
            console.error('Error tracking order:', error);
            setResult({
                found: false,
                message: 'Unable to track order. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        const statusLower = status.toLowerCase();
        if (statusLower.includes('delivered')) return <CheckCircle className="h-6 w-6 text-green-500" />;
        if (statusLower.includes('shipped') || statusLower.includes('transit')) return <Truck className="h-6 w-6 text-blue-500" />;
        if (statusLower.includes('processing')) return <Clock className="h-6 w-6 text-orange-500" />;
        return <Package className="h-6 w-6 text-gray-500" />;
    };

    const getStatusColor = (status: string) => {
        const statusLower = status.toLowerCase();
        if (statusLower.includes('delivered')) return 'bg-green-500';
        if (statusLower.includes('shipped') || statusLower.includes('transit')) return 'bg-blue-500';
        if (statusLower.includes('processing')) return 'bg-orange-500';
        return 'bg-gray-400';
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-peach-50 via-white to-peach-100">
            <Navigation />

            {/* Hero Section */}
            <section className="relative py-16 bg-gradient-to-br from-peach-400 via-peach-300 to-white overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.5) 1px, transparent 0)`,
                            backgroundSize: '40px 40px',
                        }}
                    ></div>
                </div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/40 backdrop-blur-sm px-5 py-2.5 rounded-full text-peach-900 text-sm font-semibold mb-6 animate-fadeIn shadow-lg border border-white/60">
                        <Package className="h-4 w-4 text-peach-600" />
                        AI-Powered Order Tracking
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-peach-900 mb-6 tracking-tight animate-slideInLeft">
                        Track Your Order
                    </h1>
                    <p className="text-xl md:text-2xl text-peach-800 max-w-2xl mx-auto animate-slideInRight">
                        Get real-time updates on your VERSE purchase
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12 flex-1">
                <div className="container mx-auto px-4 max-w-4xl">
                    {/* Search Form */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border-2 border-peach-200 shadow-2xl shadow-peach-100/50 mb-8">
                        <form onSubmit={handleTrackOrder} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Order ID
                                </label>
                                <input
                                    type="text"
                                    value={orderId}
                                    onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                                    placeholder="e.g., VERSE001"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-peach-400 focus:outline-none transition-colors"
                                />
                            </div>

                            <div className="text-center text-sm text-gray-500">OR</div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="e.g., +91 98765 43210"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-peach-400 focus:outline-none transition-colors"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || (!orderId.trim() && !phone.trim())}
                                className="w-full py-4 bg-gradient-to-r from-peach-400 to-peach-500 text-white font-bold rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Tracking...
                                    </>
                                ) : (
                                    <>
                                        <Search className="h-5 w-5" />
                                        Track Order
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-center text-gray-500">
                                Demo: Try VERSE001, VERSE002, or VERSE003
                            </p>
                        </form>
                    </div>

                    {/* Results */}
                    {result && (
                        <div className="space-y-6 animate-fadeIn">
                            {result.found ? (
                                <>
                                    {/* AI Update */}
                                    <div className="bg-gradient-to-br from-peach-50 to-white border-2 border-peach-200 rounded-2xl p-6">
                                        <div className="flex items-start gap-3 mb-4">
                                            <div className="w-10 h-10 bg-gradient-to-r from-peach-400 to-peach-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                <Sparkles className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 mb-1">AI Assistant Update</h3>
                                                <p className="text-gray-700 leading-relaxed">
                                                    {result.naturalLanguageUpdate}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Details */}
                                    <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-600">Order ID</h3>
                                                <p className="text-2xl font-bold text-gray-900">{result.orderId}</p>
                                            </div>
                                            <div className="text-right">
                                                <h3 className="text-sm font-semibold text-gray-600">Estimated Delivery</h3>
                                                <p className="text-lg font-bold text-peach-600">{result.estimatedDelivery}</p>
                                            </div>
                                        </div>

                                        {/* Timeline */}
                                        <div className="space-y-4">
                                            <h4 className="font-bold text-gray-900 mb-4">Order Timeline</h4>
                                            {result.timeline?.map((item, index) => (
                                                <div key={index} className="flex gap-4">
                                                    <div className="flex flex-col items-center">
                                                        <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`} />
                                                        {index < (result.timeline?.length || 0) - 1 && (
                                                            <div className="w-0.5 h-full bg-gray-200 my-1" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 pb-6">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            {getStatusIcon(item.status)}
                                                            <h5 className="font-semibold text-gray-900">{item.status}</h5>
                                                        </div>
                                                        <p className="text-sm text-gray-600">{item.date}</p>
                                                        {item.location && (
                                                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                                <MapPin className="h-3 w-3" />
                                                                {item.location}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 text-center">
                                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{result.message}</h3>
                                    {result.suggestion && (
                                        <p className="text-gray-600">{result.suggestion}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default OrderTracking;
