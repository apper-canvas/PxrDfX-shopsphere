/**
 * Service for shopping cart operations
 */
import apperService from './ApperService';
import { TABLES } from '../config/apperConfig';
import { CART_ITEM_FIELDS } from '../config/tableFields';
import productService from './ProductService';

class CartService {
  // Fetch cart items for the current user
  async fetchCartItems() {
    // If user is authenticated, fetch from database
    if (apperService.isAuthenticated()) {
      const user = apperService.getCurrentUser();
      
      const params = {
        fields: CART_ITEM_FIELDS,
        filter: {
          field: 'Owner',
          operator: 'eq',
          value: user.id
        }
      };
      
      const cartItems = await apperService.fetchRecords(TABLES.CART_ITEM, params);
      
      // Fetch product details for each cart item
      const itemsWithProducts = await Promise.all(
        cartItems.map(async (item) => {
          const product = await productService.fetchProductById(item.product_id);
          return {
            ...item,
            product
          };
        })
      );
      
      return itemsWithProducts;
    } 
    // If user is not authenticated, get from local storage
    else {
      try {
        const localCart = localStorage.getItem('cart');
        const cartItems = localCart ? JSON.parse(localCart) : [];
        
        // Fetch product details for each cart item
        const itemsWithProducts = await Promise.all(
          cartItems.map(async (item) => {
            const product = await productService.fetchProductById(item.product_id);
            return {
              ...item,
              product
            };
          })
        );
        
        return itemsWithProducts;
      } catch (error) {
        console.error('Error getting cart from local storage:', error);
        return [];
      }
    }
  }

  // Add item to cart
  async addToCart(productId, quantity = 1) {
    // If user is authenticated, add to database
    if (apperService.isAuthenticated()) {
      // Check if item already exists in cart
      const cartItems = await this.fetchCartItems();
      const existingItem = cartItems.find(item => item.product_id === productId);
      
      if (existingItem) {
        // Update quantity of existing item
        const newQuantity = existingItem.quantity + quantity;
        return this.updateCartItem(existingItem.Id, newQuantity);
      } else {
        // Add new item to cart
        const params = {
          record: {
            product_id: productId,
            quantity
          }
        };
        
        return apperService.createRecord(TABLES.CART_ITEM, params);
      }
    } 
    // If user is not authenticated, add to local storage
    else {
      try {
        const localCart = localStorage.getItem('cart');
        const cartItems = localCart ? JSON.parse(localCart) : [];
        
        // Check if item already exists in cart
        const existingItemIndex = cartItems.findIndex(item => item.product_id === productId);
        
        if (existingItemIndex >= 0) {
          // Update quantity of existing item
          cartItems[existingItemIndex].quantity += quantity;
        } else {
          // Add new item to cart
          cartItems.push({
            id: Date.now(),
            product_id: productId,
            quantity
          });
        }
        
        localStorage.setItem('cart', JSON.stringify(cartItems));
        return cartItems;
      } catch (error) {
        console.error('Error adding to cart in local storage:', error);
        throw error;
      }
    }
  }

  // Update cart item quantity
  async updateCartItem(cartItemId, quantity) {
    // If user is authenticated, update in database
    if (apperService.isAuthenticated()) {
      const params = {
        record: {
          quantity
        }
      };
      
      return apperService.updateRecord(TABLES.CART_ITEM, cartItemId, params);
    } 
    // If user is not authenticated, update in local storage
    else {
      try {
        const localCart = localStorage.getItem('cart');
        if (!localCart) return null;
        
        const cartItems = JSON.parse(localCart);
        const itemIndex = cartItems.findIndex(item => item.id === cartItemId);
        
        if (itemIndex >= 0) {
          cartItems[itemIndex].quantity = quantity;
          localStorage.setItem('cart', JSON.stringify(cartItems));
          return cartItems[itemIndex];
        }
        
        return null;
      } catch (error) {
        console.error('Error updating cart item in local storage:', error);
        throw error;
      }
    }
  }

  // Remove item from cart
  async removeFromCart(cartItemId) {
    // If user is authenticated, remove from database
    if (apperService.isAuthenticated()) {
      return apperService.deleteRecord(TABLES.CART_ITEM, cartItemId);
    } 
    // If user is not authenticated, remove from local storage
    else {
      try {
        const localCart = localStorage.getItem('cart');
        if (!localCart) return true;
        
        const cartItems = JSON.parse(localCart);
        const updatedItems = cartItems.filter(item => item.id !== cartItemId);
        
        localStorage.setItem('cart', JSON.stringify(updatedItems));
        return true;
      } catch (error) {
        console.error('Error removing item from cart in local storage:', error);
        throw error;
      }
    }
  }

  // Clear cart
  async clearCart() {
    // If user is authenticated, delete all cart items from database
    if (apperService.isAuthenticated()) {
      const cartItems = await this.fetchCartItems();
      
      // Delete each cart item
      await Promise.all(
        cartItems.map(item => apperService.deleteRecord(TABLES.CART_ITEM, item.Id))
      );
      
      return true;
    } 
    // If user is not authenticated, clear local storage
    else {
      try {
        localStorage.removeItem('cart');
        return true;
      } catch (error) {
        console.error('Error clearing cart from local storage:', error);
        throw error;
      }
    }
  }

  // Transfer guest cart to user account after login
  async transferGuestCart() {
    try {
      const localCart = localStorage.getItem('cart');
      if (!localCart) return;
      
      const cartItems = JSON.parse(localCart);
      
      // Add each item to user's cart in database
      await Promise.all(
        cartItems.map(item => this.addToCart(item.product_id, item.quantity))
      );
      
      // Clear local cart after transfer
      localStorage.removeItem('cart');
      
      return true;
    } catch (error) {
      console.error('Error transferring guest cart:', error);
      return false;
    }
  }

  // Calculate cart totals
  async getCartTotals() {
    const cartItems = await this.fetchCartItems();
    
    const subtotal = cartItems.reduce((total, item) => {
      const price = item.product ? item.product.price : 0;
      return total + (price * item.quantity);
    }, 0);
    
    // Example tax calculation (adjust as needed)
    const taxRate = 0.07; // 7%
    const tax = subtotal * taxRate;
    
    // Example shipping calculation (adjust as needed)
    const shipping = subtotal > 100 ? 0 : 10;
    
    const total = subtotal + tax + shipping;
    
    return {
      subtotal,
      tax,
      shipping,
      total,
      itemCount: cartItems.reduce((count, item) => count + item.quantity, 0)
    };
  }
}

// Create singleton instance
const cartService = new CartService();
export default cartService;