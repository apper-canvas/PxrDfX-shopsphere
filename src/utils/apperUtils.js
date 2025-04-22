/**
 * Utility functions for working with Apper data
 */

// Format a date from ISO string or Date object
export function formatDate(dateValue, format = 'standard') {
  if (!dateValue) return '';
  
  const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
  
  if (isNaN(date.getTime())) return '';
  
  switch (format) {
    case 'standard':
      return date.toLocaleDateString();
    case 'long':
      return date.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    case 'datetime':
      return date.toLocaleString();
    case 'time':
      return date.toLocaleTimeString();
    default:
      return date.toLocaleDateString();
  }
}

// Format currency
export function formatCurrency(amount, currency = 'USD') {
  if (amount === null || amount === undefined) return '';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
}

// Generate table filter for Apper API
export function buildFilter(filters) {
  if (!filters || !Array.isArray(filters) || filters.length === 0) {
    return undefined;
  }
  
  if (filters.length === 1) {
    return filters[0];
  }
  
  return {
    and: filters
  };
}

// Format phone number for display
export function formatPhone(phone) {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Format based on length
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 11) {
    return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  
  // Return original if it doesn't match expected format
  return phone;
}

// Validate email format
export function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

// Validate phone format
export function isValidPhone(phone) {
  const phoneRegex = /^\+?[1-9]\d{9,14}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
}

// Format Apper object for display
export function formatRecordForDisplay(record) {
  if (!record) return {};
  
  const displayRecord = { ...record };
  
  // Format dates
  const dateFields = ['CreatedOn', 'ModifiedOn', 'order_date', 'created_at', 'LastLoginDate'];
  dateFields.forEach(field => {
    if (displayRecord[field]) {
      displayRecord[field] = formatDate(displayRecord[field]);
    }
  });
  
  // Format currency
  const currencyFields = ['price', 'total_amount', 'total'];
  currencyFields.forEach(field => {
    if (displayRecord[field] !== undefined) {
      displayRecord[field] = formatCurrency(displayRecord[field]);
    }
  });
  
  // Format phone numbers
  const phoneFields = ['Phone', 'phone'];
  phoneFields.forEach(field => {
    if (displayRecord[field]) {
      displayRecord[field] = formatPhone(displayRecord[field]);
    }
  });
  
  return displayRecord;
}

// Parse query parameters for table filters
export function parseQueryParams(queryParams) {
  const filters = [];
  
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value && key !== 'page' && key !== 'limit' && key !== 'sort') {
      filters.push({
        field: key,
        operator: 'eq',
        value
      });
    }
  });
  
  return filters;
}

// Transform an order record for API submission
export function prepareOrderForSubmission(orderData) {
  const prepared = { ...orderData };
  
  // Ensure date fields are in ISO format
  if (prepared.order_date && !(prepared.order_date instanceof Date)) {
    prepared.order_date = new Date(prepared.order_date).toISOString();
  }
  
  return prepared;
}