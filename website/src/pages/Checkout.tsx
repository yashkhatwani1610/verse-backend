import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Banknote, Package, MapPin, User, CheckCircle } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { getCart, getCartTotal, clearCart } from '../lib/cart';
import type { CartItem } from '../lib/cart';

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface CustomerDetails {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
}

const Checkout = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Confirmation
    const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
    const [orderId, setOrderId] = useState('');
    const [loading, setLoading] = useState(false);

    const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: ''
    });

    useEffect(() => {
        const cart = getCart();
        if (cart.length === 0) {
            navigate('/products');
        }
        setCartItems(cart);
    }, [navigate]);

    const total = getCartTotal();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomerDetails({
            ...customerDetails,
            [e.target.name]: e.target.value
        });
    };

    const validateDetails = () => {
        const { fullName, email, phone, address, city, state, pincode } = customerDetails;
        if (!fullName || !email || !phone || !address || !city || !state || !pincode) {
            alert('Please fill in all fields');
            return false;
        }
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            alert('Please enter a valid email');
            return false;
        }
        if (!/^\d{10}$/.test(phone)) {
            alert('Please enter a valid 10-digit phone number');
            return false;
        }
        if (!/^\d{6}$/.test(pincode)) {
            alert('Please enter a valid 6-digit PIN code');
            return false;
        }
        return true;
    };

    const handleContinueToPayment = () => {
        if (validateDetails()) {
            setStep(2);
        }
    };

    const handleCODOrder = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:7860/api/create-order-cod', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerDetails,
                    items: cartItems,
                    total
                })
            });

            const data = await response.json();

            if (data.orderId) {
                setOrderId(data.orderId);
                setStep(3);
                clearCart();
            } else {
                alert('Failed to create order. Please try again.');
            }
        } catch (error) {
            console.error('COD order error:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRazorpayPayment = async () => {
        setLoading(true);
        try {
            // Create Razorpay order
            const response = await fetch('http://localhost:7860/api/create-order-online', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: total * 100, // Convert to paise
                    currency: 'INR',
                    customerDetails,
                    items: cartItems
                })
            });

            const orderData = await response.json();

            // Open Razorpay checkout
            const options = {
                key: 'rzp_live_RmFbFMzaZX1gjM',
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'VERSE',
                description: 'Fashion Purchase',
                order_id: orderData.id,
                prefill: {
                    name: customerDetails.fullName,
                    email: customerDetails.email,
                    contact: customerDetails.phone
                },
                theme: {
                    color: '#F97316'
                },
                handler: async function (response: any) {
                    // Verify payment
                    const verifyResponse = await fetch('http://localhost:7860/api/verify-payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            customerDetails,
                            items: cartItems
                        })
                    });

                    const verifyData = await verifyResponse.json();

                    if (verifyData.status === 'success') {
                        setOrderId(response.razorpay_order_id);
                        setStep(3);
                        clearCart();
                    } else {
                        alert('Payment verification failed');
                    }
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                    }
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.open();
            setLoading(false);

        } catch (error) {
            console.error('Payment error:', error);
            alert('Something went wrong with the payment');
            setLoading(false);
        }
    };

    const handlePlaceOrder = () => {
        if (paymentMethod === 'cod') {
            handleCODOrder();
        } else {
            handleRazorpayPayment();
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navigation />

            <div className="flex-1 py-8 md:py-12">
                <div className="container mx-auto px-4 max-w-6xl">
                    {/* Progress Steps */}
                    <div className="mb-8 md:mb-12">
                        <div className="flex items-center justify-center">
                            <div className={`flex items-center ${step >= 1 ? 'text-peach-500' : 'text-gray-400'}`}>
                                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-base ${step >= 1 ? 'bg-peach-500 text-white' : 'bg-gray-200'}`}>
                                    1
                                </div>
                                <span className="ml-2 font-semibold text-xs md:text-base hidden sm:inline">Details</span>
                            </div>
                            <div className={`w-12 md:w-24 h-1 mx-2 md:mx-4 ${step >= 2 ? 'bg-peach-500' : 'bg-gray-200'}`}></div>
                            <div className={`flex items-center ${step >= 2 ? 'text-peach-500' : 'text-gray-400'}`}>
                                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-base ${step >= 2 ? 'bg-peach-500 text-white' : 'bg-gray-200'}`}>
                                    2
                                </div>
                                <span className="ml-2 font-semibold text-xs md:text-base hidden sm:inline">Payment</span>
                            </div>
                            <div className={`w-12 md:w-24 h-1 mx-2 md:mx-4 ${step >= 3 ? 'bg-peach-500' : 'bg-gray-200'}`}></div>
                            <div className={`flex items-center ${step >= 3 ? 'text-peach-500' : 'text-gray-400'}`}>
                                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-base ${step >= 3 ? 'bg-peach-500 text-white' : 'bg-gray-200'}`}>
                                    3
                                </div>
                                <span className="ml-2 font-semibold text-xs md:text-base hidden sm:inline">Confirmation</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            {step === 1 && (
                                <div className="bg-white rounded-2xl p-4 md:p-8 shadow-lg">
                                    <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-2">
                                        <User className="h-5 w-5 md:h-6 md:w-6 text-peach-500" />
                                        Customer Information
                                    </h2>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={customerDetails.fullName}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-peach-400 focus:outline-none transition-colors"
                                                placeholder="John Doe"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Email *
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={customerDetails.email}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-peach-400 focus:outline-none transition-colors"
                                                    placeholder="john@example.com"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Phone Number *
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={customerDetails.phone}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-peach-400 focus:outline-none transition-colors"
                                                    placeholder="9876543210"
                                                    maxLength={10}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-peach-500" />
                                                Shipping Address *
                                            </label>
                                            <input
                                                type="text"
                                                name="address"
                                                value={customerDetails.address}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-peach-400 focus:outline-none transition-colors"
                                                placeholder="Street address, apartment, suite, etc."
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    City *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={customerDetails.city}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-peach-400 focus:outline-none transition-colors"
                                                    placeholder="Mumbai"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    State *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="state"
                                                    value={customerDetails.state}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-peach-400 focus:outline-none transition-colors"
                                                    placeholder="Maharashtra"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    PIN Code *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="pincode"
                                                    value={customerDetails.pincode}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-peach-400 focus:outline-none transition-colors"
                                                    placeholder="400001"
                                                    maxLength={6}
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleContinueToPayment}
                                            className="w-full py-4 bg-gradient-to-r from-peach-400 to-peach-500 text-white font-bold rounded-xl hover:shadow-xl transition-all"
                                        >
                                            Continue to Payment
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="bg-white rounded-2xl p-4 md:p-8 shadow-lg">
                                    <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Choose Payment Method</h2>

                                    <div className="space-y-4 mb-8">
                                        {/* Razorpay Option */}
                                        <div
                                            onClick={() => setPaymentMethod('razorpay')}
                                            className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'razorpay'
                                                ? 'border-peach-500 bg-peach-50'
                                                : 'border-gray-200 hover:border-peach-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'razorpay' ? 'border-peach-500' : 'border-gray-300'
                                                    }`}>
                                                    {paymentMethod === 'razorpay' && (
                                                        <div className="w-3 h-3 rounded-full bg-peach-500"></div>
                                                    )}
                                                </div>
                                                <CreditCard className="h-6 w-6 text-peach-500" />
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-lg">Online Payment</h3>
                                                    <p className="text-sm text-gray-600">
                                                        Credit/Debit Card, UPI, Net Banking, Wallets
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* COD Option */}
                                        <div
                                            onClick={() => setPaymentMethod('cod')}
                                            className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'cod'
                                                ? 'border-peach-500 bg-peach-50'
                                                : 'border-gray-200 hover:border-peach-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-peach-500' : 'border-gray-300'
                                                    }`}>
                                                    {paymentMethod === 'cod' && (
                                                        <div className="w-3 h-3 rounded-full bg-peach-500"></div>
                                                    )}
                                                </div>
                                                <Banknote className="h-6 w-6 text-peach-500" />
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-lg">Cash on Delivery</h3>
                                                    <p className="text-sm text-gray-600">
                                                        Pay when you receive your order
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setStep(1)}
                                            className="flex-1 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handlePlaceOrder}
                                            disabled={loading}
                                            className="flex-1 py-4 bg-gradient-to-r from-peach-400 to-peach-500 text-white font-bold rounded-xl hover:shadow-xl transition-all disabled:opacity-50"
                                        >
                                            {loading ? 'Processing...' : 'Place Order'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="bg-white rounded-2xl p-4 md:p-8 shadow-lg text-center">
                                    <CheckCircle className="h-16 w-16 md:h-20 md:w-20 text-green-500 mx-auto mb-4 md:mb-6" />
                                    <h2 className="text-2xl md:text-3xl font-bold mb-4">Order Confirmed!</h2>
                                    <p className="text-gray-600 mb-6">
                                        Thank you for your purchase. Your order has been placed successfully.
                                    </p>

                                    <div className="bg-gray-50 rounded-xl p-6 mb-6">
                                        <p className="text-sm text-gray-600 mb-2">Order ID</p>
                                        <p className="text-2xl font-bold text-peach-600">{orderId}</p>
                                    </div>

                                    <div className="space-y-3">
                                        <button
                                            onClick={() => navigate(`/track-order?orderId=${orderId}`)}
                                            className="w-full py-4 bg-gradient-to-r from-peach-400 to-peach-500 text-white font-bold rounded-xl hover:shadow-xl transition-all"
                                        >
                                            Track Your Order
                                        </button>
                                        <button
                                            onClick={() => navigate('/products')}
                                            className="w-full py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all"
                                        >
                                            Continue Shopping
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg lg:sticky lg:top-4">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <Package className="h-5 w-5 text-peach-500" />
                                    Order Summary
                                </h3>

                                <div className="space-y-4 mb-6">
                                    {cartItems.map((item, index) => {
                                        const product = item.product.node;
                                        const price = parseFloat(product.priceRange.minVariantPrice.amount);
                                        const image = product.images.edges[0]?.node.url || '';

                                        return (
                                            <div key={index} className="flex gap-3">
                                                <img
                                                    src={image}
                                                    alt={product.title}
                                                    className="w-16 h-16 object-cover rounded-lg"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-semibold text-sm">{product.title}</p>
                                                    <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                                                    <p className="text-sm font-bold text-peach-600">₹{(price * item.quantity).toFixed(2)}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="border-t pt-4 space-y-2">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span>₹{total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Shipping</span>
                                        <span className="text-green-600">FREE</span>
                                    </div>
                                    <div className="flex justify-between text-xl font-bold pt-2 border-t">
                                        <span>Total</span>
                                        <span className="text-peach-600">₹{total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Checkout;
