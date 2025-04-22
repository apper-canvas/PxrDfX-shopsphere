/**
 * Service for product-related operations
 */
import apperService from './ApperService';
import { TABLES } from '../config/apperConfig';
import { PRODUCT_FIELDS, CATEGORY_FIELDS } from '../config/tableFields';

class ProductService {
  // Fetch all products with filtering, pagination, and sorting
  async fetchProducts(options = {}) {
    const {
      filters = [],
      limit = 20,
      offset = 0,
      orderBy = [{ field: 'CreatedOn', direction: 'desc' }],
      featured = null,
      category = null,
      search = null
    } = options;

    let productFilters = [...filters];
    
    // Add featured filter if provided
    if (featured !== null) {
      productFilters.push({
        field: 'featured',
        operator: 'eq',
        value: featured
      });
    }
    
    // Add category filter if provided
    if (category) {
      productFilters.push({
        field: 'category',
        operator: 'eq',
        value: category
      });
    }
    
    // Add search filter if provided
    if (search) {
      productFilters.push({
        field: 'Name',
        operator: 'contains',
        value: search
      });
    }
    
    const params = {
      fields: PRODUCT_FIELDS,
      filter: productFilters.length > 0 ? { and: productFilters } : undefined,
      pagingInfo: { limit, offset },
      orderBy
    };
    
    return apperService.fetchRecords(TABLES.PRODUCT, params);
  }

  // Fetch a single product by ID
  async fetchProductById(productId) {
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
  }

  // Fetch featured products
  async fetchFeaturedProducts(limit = 8) {
    return this.fetchProducts({
      featured: true,
      limit
    });
  }

  // Fetch products by category
  async fetchProductsByCategory(category, limit = 20, offset = 0) {
    return this.fetchProducts({
      category,
      limit,
      offset
    });
  }

  // Fetch all categories
  async fetchCategories() {
    const params = {
      fields: CATEGORY_FIELDS,
      orderBy: [{ field: 'Name', direction: 'asc' }]
    };
    
    return apperService.fetchRecords(TABLES.CATEGORY, params);
  }

  // Create a new product
  async createProduct(productData) {
    const params = {
      record: productData
    };
    
    return apperService.createRecord(TABLES.PRODUCT, params);
  }

  // Update an existing product
  async updateProduct(productId, productData) {
    const params = {
      record: productData
    };
    
    return apperService.updateRecord(TABLES.PRODUCT, productId, params);
  }

  // Delete a product
  async deleteProduct(productId) {
    return apperService.deleteRecord(TABLES.PRODUCT, productId);
  }

  // Search products by name
  async searchProducts(query, limit = 20, offset = 0) {
    if (!query) {
      return this.fetchProducts({ limit, offset });
    }
    
    return this.fetchProducts({
      search: query,
      limit,
      offset
    });
  }
}

// Create singleton instance
const productService = new ProductService();
export default productService;