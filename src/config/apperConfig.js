/**
 * Apper configuration with Canvas ID and table names
 */

export const CANVAS_ID = 'e9cdf1cfb0bf4d26a3d004bb5a9f62de';

// Table names from the provided tables structure
export const TABLES = {
  USER: 'User',
  PRODUCT: 'product10', // Using the most complete product table
  CATEGORY: 'category4',
  CART_ITEM: 'cart_item4',
  ORDER: 'order8', // Using the most complete order table
  ORDER_ITEM: 'order_item8',
  WISHLIST_ITEM: 'wishlist_item2',
  CUSTOMER: 'Customer2'
};

// Category options
export const CATEGORIES = [
  'Electronics',
  'Furniture',
  'Wearables',
  'Kitchen',
  'Fashion'
];

// Order status options
export const ORDER_STATUSES = [
  'Pending',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled'
];

// Country options
export const COUNTRIES = [
  'US',
  'CA',
  'UK', 
  'AU',
  'DE',
  'FR'
];