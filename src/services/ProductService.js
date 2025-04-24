import apperService from './ApperService';
import { TABLES } from '../config/apperConfig';
import { PRODUCT_FIELDS } from '../config/tableFields';
import { buildFilter } from '../utils/apperUtils';

class ProductService {
  // Get products with optional filtering and pagination
  async getProducts(options = {}) {
    const {
      limit = 20,
      offset = 0,
      filter = {},
      sortField = 'CreatedOn',
      sortDirection = 'desc',
      excludeIds = []
    } = options;
    
    try {
      // Build filter object
      let filterObject = null;
      
      if (filter.field && filter.operator && filter.value !== undefined) {
        // Direct filter object provided
        filterObject = filter;
      } else if (Object.keys(filter).length > 0) {
        // Filter parameters provided as object
        const filters = [];
        
        // Process known filter fields
        if (filter.category) {
          filters.push({
            field: 'category',
            operator: 'eq',
            value: filter.category
          });
        }
        
        if (filter.query) {
          filters.push({
            field: 'Name',
            operator: 'contains',
            value: filter.query
          });
        }
        
        if (filter.featured !== undefined) {
          filters.push({
            field: 'featured',
            operator: 'eq',
            value: filter.featured
          });
        }
        
        if (filter.minPrice !== undefined) {
          filters.push({
            field: 'price',
            operator: 'ge',
            value: filter.minPrice
          });
        }
        
        if (filter.maxPrice !== undefined) {
          filters.push({
            field: 'price',
            operator: 'le',
            value: filter.maxPrice
          });
        }
        
        // If we have IDs to exclude
        if (excludeIds.length > 0) {
          filters.push({
            field: 'Id',
            operator: 'nin',
            value: excludeIds
          });
        }
        
        filterObject = buildFilter(filters);
      } else if (excludeIds.length > 0) {
        // Only exclude IDs
        filterObject = {
          field: 'Id',
          operator: 'nin',
          value: excludeIds
        };
      }
      
      const params = {
        fields: PRODUCT_FIELDS,
        pagingInfo: {
          limit,
          offset
        },
        orderBy: [{
          field: sortField,
          direction: sortDirection
        }]
      };
      
      if (filterObject) {
        params.filter = filterObject;
      }
      
      const response = await apperService.fetchRecords(TABLES.PRODUCT, params);
      
      // Get total count for pagination
      const countParams = { ...params };
      delete countParams.pagingInfo;
      countParams.countOnly = true;
      
      const countResponse = await apperService.fetchRecords(TABLES.PRODUCT, countParams);
      const total = countResponse.count || response.length;
      
      return {
        items: response,
        total,
        limit,
        offset
      };
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  }
  
  // Get product by ID
  async getProductById(productId) {
    try {
      const params = {
        fields: PRODUCT_FIELDS,
        filter: {
          field: 'Id',
          operator: 'eq',
          value: productId
        }
      };
      
      const products = await apperService.fetchRecords(TABLES.PRODUCT, params);
      return products.length > 0 ? products[0] : null;
    } catch (error) {
      console.error(`Error getting product ${productId}:`, error);
      throw error;
    }
  }
  
  // Create a new product
  async createProduct(productData) {
    try {
      return await apperService.createRecord(TABLES.PRODUCT, {
        record: productData
      });
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }
  
  // Update an existing product
  async updateProduct(productId, productData) {
    try {
      return await apperService.updateRecord(TABLES.PRODUCT, productId, {
        record: productData
      });
    } catch (error) {
      console.error(`Error updating product ${productId}:`, error);
      throw error;
    }
  }
  
  // Delete a product
  async deleteProduct(productId) {
    try {
      return await apperService.deleteRecord(TABLES.PRODUCT, productId);
    } catch (error) {
      console.error(`Error deleting product ${productId}:`, error);
      throw error;
    }
  }
  
  // Get featured products
  async getFeaturedProducts(limit = 4) {
    try {
      return this.getProducts({
        limit,
        filter: {
          field: 'featured',
          operator: 'eq',
          value: true
        }
      });
    } catch (error) {
      console.error('Error getting featured products:', error);
      throw error;
    }
  }
  
  // Search products by query
  async searchProducts(query, limit = 20) {
    try {
      return this.getProducts({
        limit,
        filter: {
          field: 'Name',
          operator: 'contains',
          value: query
        }
      });
    } catch (error) {
      console.error(`Error searching products with query "${query}":`, error);
      throw error;
    }
  }
}

// Create singleton instance
const productService = new ProductService();
export default productService;