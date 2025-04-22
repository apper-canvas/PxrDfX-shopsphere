import { useState } from 'react';
import orderService from '../services/OrderService';

/**
 * Custom hook for order operations
 */
export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user's orders
  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      const userOrders = await orderService.fetchUserOrders();
      setOrders(userOrders);
      setError(null);
      return userOrders;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch a specific order by ID
  const fetchOrderById = async (orderId) => {
    try {
      setLoading(true);
      const order = await orderService.fetchOrderById(orderId);
      setCurrentOrder(order);
      setError(null);
      return order;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create a new order
  const createOrder = async (orderData) => {
    try {
      setLoading(true);
      const createdOrder = await orderService.createOrder(orderData);
      // Add the new order to the orders list
      setOrders(prevOrders => [createdOrder, ...prevOrders]);
      setCurrentOrder(createdOrder);
      setError(null);
      return createdOrder;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Cancel an order
  const cancelOrder = async (orderId) => {
    try {
      setLoading(true);
      await orderService.cancelOrder(orderId);
      
      // Update order status in state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.Id === orderId ? { ...order, status: 'Cancelled' } : order
        )
      );
      
      if (currentOrder && currentOrder.Id === orderId) {
        setCurrentOrder({ ...currentOrder, status: 'Cancelled' });
      }
      
      setError(null);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Search orders by reference number
  const searchOrdersByReference = async (reference) => {
    try {
      setLoading(true);
      const searchResults = await orderService.searchOrdersByReference(reference);
      setOrders(searchResults);
      setError(null);
      return searchResults;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    orders,
    currentOrder,
    loading,
    error,
    fetchUserOrders,
    fetchOrderById,
    createOrder,
    cancelOrder,
    searchOrdersByReference
  };
}