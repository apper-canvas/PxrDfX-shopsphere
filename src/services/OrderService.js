import apperService from './ApperService';
import { TABLES } from '../config/apperConfig';
import { ORDER_FIELDS, ORDER_ITEM_FIELDS } from '../config/tableFields';
import productService from './ProductService';

class OrderService {
  // Get orders for current user
  async getOrders(options = {}) {
    try {
      const { limit, offset } = options;
      
      const params = {
        fields: ORDER_FIELDS,
        orderBy: [{
          field: 'CreatedOn',
          direction: 'desc'
        }]
      };
      
      if (limit) {
        params.pagingInfo = {
          limit,
          offset: offset || 0
        };
      }
      
      return await apperService.fetchRecords(TABLES.ORDER, params);
    } catch (error) {
      console.error('Error getting orders:', error);
      throw error;
    }
  }
  
  // Get order by ID
  async getOrderById(orderId) {
    try {
      const params = {
        fields: ORDER_FIELDS,
        filter: {
          field: 'Id',
          operator: 'eq',
          value: orderId
        }
      };
      
      const orders = await apperService.fetchRecords(TABLES.ORDER, params);
      return orders.length > 0 ? orders[0] : null;
    } catch (error) {
      console.error(`Error getting order ${orderId}:`, error);
      throw error;
    }
  }
  
  // Create a new order
  async createOrder(orderData) {
    try {
      return await apperService.createRecord(TABLES.ORDER, {
        record: orderData
      });
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }
  
  // Update an existing order
  async updateOrder(orderId, orderData) {
    try {
      return await apperService.updateRecord(TABLES.ORDER, orderId, {
        record: orderData
      });
    } catch (error) {
      console.error(`Error updating order ${orderId}:`, error);
      throw error;
    }
  }
  
  // Delete an order
  async deleteOrder(orderId) {
    try {
      return await apperService.deleteRecord(TABLES.ORDER, orderId);
    } catch (error) {
      console.error(`Error deleting order ${orderId}:`, error);
      throw error;
    }
  }
  
  // Get order items for an order
  async getOrderItems(orderId) {
    try {
      const params = {
        fields: ORDER_ITEM_FIELDS,
        filter: {
          field: 'order_id',
          operator: 'eq',
          value: { Id: orderId }
        },
        orderBy: [{
          field: 'CreatedOn',
          direction: 'asc'
        }]
      };
      
      const orderItems = await apperService.fetchRecords(TABLES.ORDER_ITEM, params);
      
      // Fetch product details for each order item
      const enhancedOrderItems = await Promise.all(orderItems.map(async (item) => {
        if (item.product_id?.Id) {
          const product = await productService.getProductById(item.product_id.Id);
          if (product) {
            item.product_id = {
              ...item.product_id,
              Name: product.Name,
              image: product.image
            };
          }
        }
        return item;
      }));
      
      return enhancedOrderItems;
    } catch (error) {
      console.error(`Error getting order items for order ${orderId}:`, error);
      throw error;
    }
  }
  
  // Create an order item
  async createOrderItem(orderItemData) {
    try {
      return await apperService.createRecord(TABLES.ORDER_ITEM, {
        record: orderItemData
      });
    } catch (error) {
      console.error('Error creating order item:', error);
      throw error;
    }
  }
  
  // Get recent orders for current user
  async getRecentOrders(limit = 5) {
    try {
      return this.getOrders({ limit });
    } catch (error) {
      console.error('Error getting recent orders:', error);
      throw error;
    }
  }
  
  // Update order status
  async updateOrderStatus(orderId, status) {
    try {
      return await apperService.updateRecord(TABLES.ORDER, orderId, {
        record: { status }
      });
    } catch (error) {
      console.error(`Error updating status for order ${orderId}:`, error);
      throw error;
    }
  }
}

// Create singleton instance
const orderService = new OrderService();
export default orderService;