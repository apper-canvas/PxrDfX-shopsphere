/**
 * Service for order management operations
 */
import apperService from './ApperService';
import { TABLES } from '../config/apperConfig';
import { ORDER_FIELDS, ORDER_ITEM_FIELDS } from '../config/tableFields';
import cartService from './CartService';
import { format } from 'date-fns';

class OrderService {
  // Fetch orders for the current user
  async fetchUserOrders() {
    if (!apperService.isAuthenticated()) {
      throw new Error('User must be authenticated to fetch orders');
    }
    
    const user = apperService.getCurrentUser();
    
    const params = {
      fields: ORDER_FIELDS,
      filter: {
        field: 'Owner',
        operator: 'eq',
        value: user.id
      },
      orderBy: [{ field: 'CreatedOn', direction: 'desc' }]
    };
    
    return apperService.fetchRecords(TABLES.ORDER, params);
  }

  // Fetch a single order by ID
  async fetchOrderById(orderId) {
    if (!apperService.isAuthenticated()) {
      throw new Error('User must be authenticated to fetch order details');
    }
    
    const params = {
      fields: ORDER_FIELDS,
      filter: {
        field: 'Id',
        operator: 'eq',
        value: orderId
      }
    };
    
    const orders = await apperService.fetchRecords(TABLES.ORDER, params);
    if (orders.length === 0) {
      return null;
    }
    
    const order = orders[0];
    
    // Fetch order items
    const orderItems = await this.fetchOrderItems(orderId);
    
    return {
      ...order,
      items: orderItems
    };
  }

  // Fetch order items for a specific order
  async fetchOrderItems(orderId) {
    const params = {
      fields: ORDER_ITEM_FIELDS,
      filter: {
        field: 'order_id',
        operator: 'eq',
        value: orderId
      }
    };
    
    return apperService.fetchRecords(TABLES.ORDER_ITEM, params);
  }

  // Create a new order from cart
  async createOrder(orderData) {
    if (!apperService.isAuthenticated()) {
      throw new Error('User must be authenticated to create an order');
    }
    
    try {
      // Get cart items and totals
      const cartItems = await cartService.fetchCartItems();
      const { total } = await cartService.getCartTotals();
      
      if (cartItems.length === 0) {
        throw new Error('Cannot create order with empty cart');
      }
      
      // Generate order reference
      const orderReference = this.generateOrderReference();
      
      // Create order record
      const orderParams = {
        record: {
          order_reference: orderReference,
          full_name: orderData.full_name,
          email: orderData.email,
          address: orderData.address,
          city: orderData.city,
          zip_code: orderData.zip_code,
          country: orderData.country,
          total_amount: total,
          status: 'Pending',
          created_at: new Date().toISOString()
        }
      };
      
      const createdOrder = await apperService.createRecord(TABLES.ORDER, orderParams);
      
      // Create order items for each cart item
      await Promise.all(
        cartItems.map(async (item) => {
          const orderItemParams = {
            record: {
              order_id: createdOrder.Id,
              product_id: item.product_id,
              quantity: item.quantity,
              price: item.product.price
            }
          };
          
          return apperService.createRecord(TABLES.ORDER_ITEM, orderItemParams);
        })
      );
      
      // Clear the cart after creating the order
      await cartService.clearCart();
      
      return createdOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Generate a unique order reference
  generateOrderReference() {
    const timestamp = Date.now();
    const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const datePart = format(new Date(), 'yyyyMMdd');
    
    return `ORD-${datePart}-${randomPart}`;
  }

  // Update order status
  async updateOrderStatus(orderId, status) {
    if (!apperService.isAuthenticated()) {
      throw new Error('User must be authenticated to update order status');
    }
    
    const params = {
      record: {
        status
      }
    };
    
    return apperService.updateRecord(TABLES.ORDER, orderId, params);
  }

  // Cancel an order
  async cancelOrder(orderId) {
    return this.updateOrderStatus(orderId, 'Cancelled');
  }

  // Search orders by reference number
  async searchOrdersByReference(reference) {
    if (!apperService.isAuthenticated()) {
      throw new Error('User must be authenticated to search orders');
    }
    
    if (!reference) {
      return this.fetchUserOrders();
    }
    
    const params = {
      fields: ORDER_FIELDS,
      filter: {
        and: [
          {
            field: 'Owner',
            operator: 'eq',
            value: apperService.getCurrentUser().id
          },
          {
            field: 'order_reference',
            operator: 'contains',
            value: reference
          }
        ]
      },
      orderBy: [{ field: 'CreatedOn', direction: 'desc' }]
    };
    
    return apperService.fetchRecords(TABLES.ORDER, params);
  }
}

// Create singleton instance
const orderService = new OrderService();
export default orderService;