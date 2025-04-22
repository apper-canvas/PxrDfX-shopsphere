/**
 * Core Apper service to handle communication with the Apper backend
 */
import { CANVAS_ID } from '../config/apperConfig';

class ApperService {
  constructor() {
    this.initialized = false;
    this.initializeClient();
  }

  // Initialize the Apper client
  initializeClient() {
    if (window.ApperSDK && !this.initialized) {
      const { ApperClient } = window.ApperSDK;
      this.client = new ApperClient(CANVAS_ID);
      this.initialized = true;
      return true;
    }
    return false;
  }

  // Get the ApperClient instance
  getClient() {
    if (!this.initialized) {
      const initialized = this.initializeClient();
      if (!initialized) {
        throw new Error('Apper SDK not loaded or client not initialized');
      }
    }
    return this.client;
  }

  // Get the ApperUI instance
  getUI() {
    if (window.ApperSDK) {
      return window.ApperSDK.ApperUI;
    }
    throw new Error('Apper SDK not loaded');
  }

  // Fetch records from a table
  async fetchRecords(tableName, params = {}) {
    try {
      const client = this.getClient();
      const response = await client.fetchRecords(tableName, params);
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching records from ${tableName}:`, error);
      throw error;
    }
  }

  // Create a record in a table
  async createRecord(tableName, params = {}) {
    try {
      const client = this.getClient();
      const response = await client.createRecord(tableName, params);
      return response.data;
    } catch (error) {
      console.error(`Error creating record in ${tableName}:`, error);
      throw error;
    }
  }

  // Update a record in a table
  async updateRecord(tableName, recordId, params = {}) {
    try {
      const client = this.getClient();
      const response = await client.updateRecord(tableName, recordId, params);
      return response.data;
    } catch (error) {
      console.error(`Error updating record ${recordId} in ${tableName}:`, error);
      throw error;
    }
  }

  // Delete a record from a table
  async deleteRecord(tableName, recordId) {
    try {
      const client = this.getClient();
      const response = await client.deleteRecord(tableName, recordId);
      return response.data;
    } catch (error) {
      console.error(`Error deleting record ${recordId} from ${tableName}:`, error);
      throw error;
    }
  }

  // Setup authentication UI
  setupAuth(elementId, options = {}) {
    try {
      const client = this.getClient();
      const ui = this.getUI();
      
      ui.setup(client, {
        target: elementId,
        clientId: CANVAS_ID,
        view: 'both',
        ...options
      });
      
      return ui;
    } catch (error) {
      console.error('Error setting up authentication:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    try {
      const userData = localStorage.getItem('apperUser');
      return !!userData;
    } catch (error) {
      return false;
    }
  }

  // Get current user data
  getCurrentUser() {
    try {
      const userData = localStorage.getItem('apperUser');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Logout user
  logout() {
    try {
      localStorage.removeItem('apperUser');
      // Additional cleanup if needed
      return true;
    } catch (error) {
      console.error('Error logging out:', error);
      return false;
    }
  }
}

// Create singleton instance
const apperService = new ApperService();
export default apperService;