/**
 * Table field definitions for data binding
 * These are extracted from the tables & fields JSON
 */

// User fields for fetching and display
export const USER_FIELDS = [
  'Id',
  'Name',
  'Email',
  'FirstName',
  'LastName',
  'Phone',
  'AvatarUrl',
  'IsEmailVerified',
  'CreatedOn'
];

// Product fields
export const PRODUCT_FIELDS = [
  'Id',
  'Name',
  'price',
  'image',
  'category',
  'rating',
  'reviews',
  'description',
  'featured',
  'discount',
  'CreatedOn'
];

// Category fields
export const CATEGORY_FIELDS = [
  'Id',
  'Name'
];

// Cart item fields
export const CART_ITEM_FIELDS = [
  'Id',
  'Name',
  'quantity',
  'product_id',
  'CreatedOn'
];

// Order fields
export const ORDER_FIELDS = [
  'Id',
  'Name',
  'order_reference',
  'full_name',
  'email',
  'address',
  'city',
  'zip_code',
  'country',
  'total_amount',
  'status',
  'created_at',
  'CreatedOn'
];

// Order item fields
export const ORDER_ITEM_FIELDS = [
  'Id',
  'Name',
  'quantity',
  'price',
  'order_id',
  'product_id',
  'CreatedOn'
];

// Wishlist item fields
export const WISHLIST_ITEM_FIELDS = [
  'Id',
  'Name',
  'product_id',
  'CreatedOn'
];

// Customer fields
export const CUSTOMER_FIELDS = [
  'Id',
  'Name',
  'email',
  'phone',
  'address',
  'CreatedOn'
];

// Mapping of field types for validation
export const FIELD_TYPES = {
  'Name': 'text',
  'price': 'currency',
  'image': 'text',
  'category': 'picklist',
  'rating': 'rating',
  'reviews': 'number',
  'description': 'multilinetext',
  'featured': 'boolean',
  'discount': 'number',
  'quantity': 'number',
  'product_id': 'lookup',
  'order_id': 'lookup',
  'email': 'email',
  'phone': 'phone',
  'address': 'multilinetext',
  'city': 'text',
  'zip_code': 'text',
  'country': 'picklist',
  'total_amount': 'currency',
  'status': 'picklist',
  'created_at': 'datetime',
  'order_reference': 'text',
  'full_name': 'text',
  'in_stock': 'boolean'
};