/**
 * Service for user-related operations
 */
import apperService from './ApperService';
import { TABLES } from '../config/apperConfig';
import { USER_FIELDS, CUSTOMER_FIELDS } from '../config/tableFields';

class UserService {
  // Setup authentication UI
  setupAuth(elementId, callbacks = {}) {
    const options = {
      onSuccess: (user, account) => {
        // Store user details in localStorage
        localStorage.setItem('apperUser', JSON.stringify(user.data));
        
        // Create or update customer record if needed
        this.ensureCustomerExists(user.data);
        
        if (callbacks.onSuccess) {
          callbacks.onSuccess(user, account);
        }
      },
      onError: (error) => {
        console.error('Authentication error:', error);
        if (callbacks.onError) {
          callbacks.onError(error);
        }
      },
      ...callbacks
    };
    
    return apperService.setupAuth(elementId, options);
  }

  // Show login UI
  showLogin(elementId) {
    const ui = apperService.getUI();
    ui.showLogin(elementId);
  }

  // Show signup UI
  showSignup(elementId) {
    const ui = apperService.getUI();
    ui.showSignup(elementId);
  }

  // Get current authenticated user
  getCurrentUser() {
    return apperService.getCurrentUser();
  }

  // Check if user is authenticated
  isAuthenticated() {
    return apperService.isAuthenticated();
  }

  // Logout user
  logout() {
    return apperService.logout();
  }

  // Create or update customer record from user data
  async ensureCustomerExists(userData) {
    if (!userData || !userData.emailAddress) {
      return null;
    }

    try {
      // Check if customer already exists with this email
      const existingCustomers = await this.getCustomerByEmail(userData.emailAddress);
      
      if (existingCustomers.length > 0) {
        // Customer exists, update if needed
        const customer = existingCustomers[0];
        
        // If customer needs updating, do it here
        // For now we'll just return the existing customer
        return customer;
      } else {
        // Create new customer record
        const newCustomer = {
          Name: userData.firstName && userData.lastName 
            ? `${userData.firstName} ${userData.lastName}`
            : userData.emailAddress,
          email: userData.emailAddress,
          phone: userData.phone || ''
        };
        
        const createdCustomer = await apperService.createRecord(TABLES.CUSTOMER, {
          record: newCustomer
        });
        
        return createdCustomer;
      }
    } catch (error) {
      console.error('Error ensuring customer exists:', error);
      return null;
    }
  }

  // Get customer by email
  async getCustomerByEmail(email) {
    if (!email) return [];
    
    const params = {
      fields: CUSTOMER_FIELDS,
      filter: {
        field: 'email',
        operator: 'eq',
        value: email
      }
    };
    
    return apperService.fetchRecords(TABLES.CUSTOMER, params);
  }

  // Get customer by ID
  async getCustomerById(customerId) {
    if (!customerId) return null;
    
    const params = {
      fields: CUSTOMER_FIELDS,
      filter: {
        field: 'Id',
        operator: 'eq',
        value: customerId
      }
    };
    
    const customers = await apperService.fetchRecords(TABLES.CUSTOMER, params);
    return customers.length > 0 ? customers[0] : null;
  }

  // Update customer data
  async updateCustomer(customerId, customerData) {
    const params = {
      record: customerData
    };
    
    return apperService.updateRecord(TABLES.CUSTOMER, customerId, params);
  }

  // Fetch user's wishlist items
  async fetchWishlistItems(userId) {
    if (!userId) return [];
    
    const params = {
      fields: ['Id', 'Name', 'product_id', 'CreatedOn'],
      filter: {
        field: 'Owner',
        operator: 'eq',
        value: userId
      }
    };
    
    return apperService.fetchRecords(TABLES.WISHLIST_ITEM, params);
  }

  // Add item to wishlist
  async addToWishlist(productId) {
    if (!this.isAuthenticated()) {
      throw new Error('User must be authenticated to add to wishlist');
    }
    
    const params = {
      record: {
        product_id: productId
      }
    };
    
    return apperService.createRecord(TABLES.WISHLIST_ITEM, params);
  }

  // Remove item from wishlist
  async removeFromWishlist(wishlistItemId) {
    return apperService.deleteRecord(TABLES.WISHLIST_ITEM, wishlistItemId);
  }
}

// Create singleton instance
const userService = new UserService();
export default userService;