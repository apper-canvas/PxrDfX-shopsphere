/**
 * Formatting utilities for display
 */

// Format a price with currency symbol
export function formatPrice(price, locale = 'en-US', currency = 'USD') {
  if (price === null || price === undefined) return '';
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(price);
  } catch (error) {
    console.error('Error formatting price:', error);
    return `$${price.toFixed(2)}`;
  }
}

// Format a percentage (e.g., discount)
export function formatPercentage(value, decimals = 0) {
  if (value === null || value === undefined) return '';
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value / 100);
  } catch (error) {
    console.error('Error formatting percentage:', error);
    return `${value}%`;
  }
}

// Format a date
export function formatDate(date, format = 'medium') {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  const options = {
    short: { year: 'numeric', month: 'numeric', day: 'numeric' },
    medium: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
    relative: null // Special case, handled separately
  };
  
  if (format === 'relative') {
    const now = new Date();
    const diffInMs = now - dateObj;
    const diffInSec = Math.floor(diffInMs / 1000);
    const diffInMin = Math.floor(diffInSec / 60);
    const diffInHours = Math.floor(diffInMin / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInSec < 60) return 'just now';
    if (diffInMin < 60) return `${diffInMin} minute${diffInMin > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    // Fall back to medium format for older dates
    return dateObj.toLocaleDateString(undefined, options.medium);
  }
  
  return dateObj.toLocaleDateString(undefined, options[format] || options.medium);
}

// Format a user's name
export function formatName(user) {
  if (!user) return '';
  
  if (user.FirstName && user.LastName) {
    return `${user.FirstName} ${user.LastName}`;
  }
  
  if (user.full_name) {
    return user.full_name;
  }
  
  if (user.Name) {
    return user.Name;
  }
  
  return user.email || 'Unknown User';
}

// Truncate text with ellipsis
export function truncateText(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return `${text.substring(0, maxLength)}...`;
}

// Format a phone number
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

// Get readable file size
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
}

// Format a rating (e.g., 4.5 -> "4.5/5")
export function formatRating(rating, maxRating = 5) {
  if (rating === null || rating === undefined) return '';
  
  return `${rating.toFixed(1)}/${maxRating}`;
}