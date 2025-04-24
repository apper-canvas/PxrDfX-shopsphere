import apperService from './ApperService';
import { TABLES } from '../config/apperConfig';
import { CART_ITEM_FIELDS } from '../config/tableFields';
import userService from './UserService';
import productService from './ProductService';

class CartService {
  // Get cart items for current user
  async getCartItems() {
    try {
      if (!userService.isAuthenticated()) {
        return [];
      }
      
      const params = {
        fields: [...CART_ITEM_FIELDS, 'CreatedOn'],
        orderBy: [{
          field: 'CreatedOn',
          direction: 'desc'
        }]
      };
      
      const cartItems = await apperService.fetchRecords(TABLES.CART_ITEM, params);
      
      // Fetch product details for each cart item
      const enhancedCartItems = await Promise.all(cartItems.map(async (item) => {
        if (item.product_id?.Id) {
          const product = await productService.getProductById(item.product_id.Id);
          if (product) {
            item.product_id = {
              ...item.product_id,
              Name: product.Name,
              price: product.price,
              image: product.image
            };
            
            // Use product price if cart item price is not set
            if (!item.price) {
              item.price = product.price;
            }
          }
        }
        return item;
      }));
      
      return enhancedCartItems;
    } catch (error) {
      console.error('Error getting cart items:', error);
      throw error;
    }
  }
  
  // Add item to cart
  async addToCart(productId, quantity = 1) {
    try {
      if (!userService.isAuthenticated()) {
        throw new Error('User must be authenticated to add to cart');
      }
      
      // Check if product exists
      const product = await productService.getProductById(productId);
      if (!product) {
        throw new Error('Product not found');
      }
      
      // Check if item already exists in cart
      const existingItems = await this.getCartItemByProductId(productId);
      
      if (existingItems.length > 0) {
        // Update quantity of existing item
        const existingItem = existingItems[0];
        const newQuantity = (existingItem.quantity || 1) + quantity;
        
        return await this.updateCartItem(existingItem.Id, newQuantity);
      } else {
        // Create new cart item
        const cartItem = {
          product_id: { Id: product.Id },
          quantity,
          price: product.price
        };
        
        const createdItem = await apperService.createRecord(TABLES.CART_ITEM, {
          record: cartItem
        });
        
        // Add product details to the created item
        createdItem.product_id = {
          Id: product.Id,
          Name: product.Name,
          price: product.price,
          image: product.image
        };
        
        return createdItem;
      }
    } catch (error) {
      console.error(`Error adding product ${productId} to cart:`, error);
      throw error;
    }
  }
  
  // Update cart item quantity
  async updateCartItem(cartItemId, quantity) {
    try {
      if (!userService.isAuthenticated()) {
        throw new Error('User must be authenticated to update cart');
      }
      
      const updatedItem = await apperService.updateRecord(TABLES.CART_ITEM, cartItemId, {
        record: { quantity }
      });
      
      // Get product details for the updated item
      if (updatedItem.product_id?.Id) {
        const product = await productService.getProductById(updatedItem.product_id.Id);
        if (product) {
          updatedItem.product_id = {
            ...updatedItem.product_id,
            Name: product.Name,
            price: product.price,
            image: product.image
          };
        }
      }
      
      return updatedItem;
    } catch (error) {
      console.error(`Error updating cart item ${cartItemId}:`, error);
      throw error;
    }
  }
  
  // Remove item from cart
  async removeFromCart(cartItemId) {
    try {
      if (!userService.isAuthenticated()) {
        throw new Error('User must be authenticated to remove from cart');
      }
      
      return await apperService.deleteRecord(TABLES.CART_ITEM, cartItemId);
    } catch (error) {
      console.error(`Error removing cart item ${cartItemId}:`, error);
      throw error;
    }
  }
  
  // Clear cart
  async clearCart() {
    try {
      if (!userService.isAuthenticated()) {
        return;
      }
      
      // Get all cart items
      const cartItems = await this.getCartItems();
      
      // Delete each cart item
      for (const item of cartItems) {
        await this.removeFromCart(item.Id);
      }
      
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }
  
  // Get cart item by product ID
  async getCartItemByProductId(productId) {
    try {
      if (!userService.isAuthenticated()) {
        return [];
      }
      
      const params = {
        fields: CART_ITEM_FIELDS,
        filter: {
          field: 'product_id',
          operator: 'eq',
          value: { Id: productId }
        }
      };
      
      return await apperService.fetchRecords(TABLES.CART_ITEM, params);
    } catch (error) {
      console.error(`Error getting cart item for product ${productId}:`, error);
      throw error;
    }
  }
}

// Create singleton instance
const cartService = new CartService();
export default cartService;