import { useState, useEffect } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCart, updateCartItemQuantity, removeFromCart, getCartTotal } from '../lib/cart';
import type { CartItem } from '../lib/cart';

interface CartProps {
    isOpen: boolean;
    onClose: () => void;
}

const Cart = ({ isOpen, onClose }: CartProps) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    useEffect(() => {
        loadCart();

        // Listen for cart updates
        const handleCartUpdate = () => loadCart();
        window.addEventListener('cartUpdated', handleCartUpdate);

        return () => window.removeEventListener('cartUpdated', handleCartUpdate);
    }, []);

    const loadCart = () => {
        setCartItems(getCart());
    };

    const handleUpdateQuantity = (productId: string, newQuantity: number, size?: string) => {
        updateCartItemQuantity(productId, newQuantity, size);
        loadCart();
    };

    const handleRemoveItem = (productId: string, size?: string) => {
        removeFromCart(productId, size);
        loadCart();
    };

    const total = getCartTotal();
    const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Cart Sidebar */}
            <div className="fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-peach-50 to-white">
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="h-6 w-6 text-peach-500" />
                        <h2 className="text-2xl font-bold text-gray-800">
                            Your Cart ({itemCount})
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-peach-100 rounded-full transition-colors"
                    >
                        <X className="h-6 w-6 text-gray-600" />
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-6">
                    {cartItems.length === 0 ? (
                        <div className="text-center py-12">
                            <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">Your cart is empty</p>
                            <button
                                onClick={onClose}
                                className="mt-4 text-peach-500 hover:text-peach-600 font-semibold"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cartItems.map((item, index) => {
                                const product = item.product.node;
                                const price = parseFloat(product.priceRange.minVariantPrice.amount);
                                const image = product.images.edges[0]?.node.url || '';

                                return (
                                    <div
                                        key={`${product.id}-${item.selectedSize || 'default'}-${index}`}
                                        className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200"
                                    >
                                        {/* Product Image */}
                                        <img
                                            src={image}
                                            alt={product.title}
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />

                                        {/* Product Details */}
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-800 mb-1">
                                                {product.title}
                                            </h3>
                                            {item.selectedSize && (
                                                <p className="text-sm text-gray-600 mb-2">
                                                    Size: {item.selectedSize}
                                                </p>
                                            )}
                                            <p className="text-peach-600 font-bold">
                                                ₹{price.toFixed(2)}
                                            </p>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-3 mt-3">
                                                <button
                                                    onClick={() => handleUpdateQuantity(product.id, item.quantity - 1, item.selectedSize)}
                                                    className="p-1 hover:bg-peach-100 rounded transition-colors"
                                                >
                                                    <Minus className="h-4 w-4 text-gray-600" />
                                                </button>
                                                <span className="w-8 text-center font-semibold">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => handleUpdateQuantity(product.id, item.quantity + 1, item.selectedSize)}
                                                    className="p-1 hover:bg-peach-100 rounded transition-colors"
                                                >
                                                    <Plus className="h-4 w-4 text-gray-600" />
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveItem(product.id, item.selectedSize)}
                                                    className="ml-auto p-2 hover:bg-red-100 rounded transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                    <div className="p-6 border-t border-gray-200 bg-gray-50">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-lg font-semibold text-gray-700">Subtotal:</span>
                            <span className="text-2xl font-bold text-peach-600">
                                ₹{total.toFixed(2)}
                            </span>
                        </div>
                        <Link
                            to="/checkout"
                            onClick={onClose}
                            className="block w-full py-4 bg-gradient-to-r from-peach-400 to-peach-500 text-white text-center font-bold rounded-xl hover:shadow-xl transition-all"
                        >
                            Proceed to Checkout
                        </Link>
                        <button
                            onClick={onClose}
                            className="block w-full mt-3 py-3 text-gray-600 text-center font-semibold hover:text-gray-800 transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default Cart;
