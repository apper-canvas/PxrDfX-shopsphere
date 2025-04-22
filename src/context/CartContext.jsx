import { createContext, useState, useEffect, useContext } from 'react';
import cartService from '../services/CartService';
import { AuthContext } from './AuthContext';

// Create the cart context
export const CartContext = createContext(null);

// Cart provider component
export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [totals, setTotals] = useState({
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    itemCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user } = useContext(AuthContext);

  // Load cart on initial load and when user changes
  useEffect(() => {
    const loadCart = async () => {
      try {
        setLoading(true);
        
        // If user just logged in, transfer guest cart
        if (user) {
          await cartService.transferGuestCart();
        }
        
        // Fetch cart items
        const cartItems = await cartService.fetchCartItems();
        setItems(cartItems);
        
        // Calculate totals
        const cartTotals = await cartService.getCartTotals();
        setTotals(cartTotals);
        
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [user]);

  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    try {
      setLoading(true);
      await cartService.addToCart(productId, quantity);
      
      // Reload cart after adding item
      const cartItems = await cartService.fetchCartItems();
      setItems(cartItems);
      
      // Recalculate totals
      const cartTotals = await cartService.getCartTotals();
      setTotals(cartTotals);
      
      setError(null);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update cart item quantity
  const updateCartItem = async (cartItemId, quantity) => {
    try {
      setLoading(true);
      await cartService.updateCartItem(cartItemId, quantity);
      
      // Reload cart after updating item
      const cartItems = await cartService.fetchCartItems();
      setItems(cartItems);
      
      // Recalculate totals
      const cartTotals = await cartService.getCartTotals();
      setTotals(cartTotals);
      
      setError(null);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (cartItemId) => {
    try {
      setLoading(true);
      await cartService.removeFromCart(cartItemId);
      
      // Reload cart after removing item
      const cartItems = await cartService.fetchCartItems();
      setItems(cartItems);
      
      // Recalculate totals
      const cartTotals = await cartService.getCartTotals();
      setTotals(cartTotals);
      
      setError(null);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      setLoading(true);
      await cartService.clearCart();
      
      // Reset cart state
      setItems([]);
      setTotals({
        subtotal: 0,
        tax: 0,
        shipping: 0,
        total: 0,
        itemCount: 0
      });
      
      setError(null);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    items,
    totals,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};