// Shopping Cart State Management
import type { ShopifyProduct } from './shopify';

export interface CartItem {
    product: ShopifyProduct;
    quantity: number;
    selectedSize?: string;
}

const CART_STORAGE_KEY = 'verse-cart';

// Get cart from localStorage
export function getCart(): CartItem[] {
    try {
        const cart = localStorage.getItem(CART_STORAGE_KEY);
        return cart ? JSON.parse(cart) : [];
    } catch (error) {
        console.error('Error loading cart:', error);
        return [];
    }
}

// Save cart to localStorage
export function saveCart(cart: CartItem[]): void {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        // Dispatch custom event for cart updates
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
    } catch (error) {
        console.error('Error saving cart:', error);
    }
}

// Add item to cart
export function addToCart(product: ShopifyProduct, quantity: number = 1, size?: string): void {
    const cart = getCart();
    const existingItemIndex = cart.findIndex(
        item => item.product.node.id === product.node.id && item.selectedSize === size
    );

    if (existingItemIndex > -1) {
        // Update quantity if item already exists
        cart[existingItemIndex].quantity += quantity;
    } else {
        // Add new item
        cart.push({ product, quantity, selectedSize: size });
    }

    saveCart(cart);
}

// Remove item from cart
export function removeFromCart(productId: string, size?: string): void {
    const cart = getCart();
    const updatedCart = cart.filter(
        item => !(item.product.node.id === productId && item.selectedSize === size)
    );
    saveCart(updatedCart);
}

// Update item quantity
export function updateCartItemQuantity(productId: string, quantity: number, size?: string): void {
    const cart = getCart();
    const itemIndex = cart.findIndex(
        item => item.product.node.id === productId && item.selectedSize === size
    );

    if (itemIndex > -1) {
        if (quantity <= 0) {
            removeFromCart(productId, size);
        } else {
            cart[itemIndex].quantity = quantity;
            saveCart(cart);
        }
    }
}

// Clear cart
export function clearCart(): void {
    saveCart([]);
}

// Get cart total
export function getCartTotal(): number {
    const cart = getCart();
    return cart.reduce((total, item) => {
        const price = parseFloat(item.product.node.priceRange.minVariantPrice.amount);
        return total + (price * item.quantity);
    }, 0);
}

// Get cart item count
export function getCartItemCount(): number {
    const cart = getCart();
    return cart.reduce((count, item) => count + item.quantity, 0);
}
