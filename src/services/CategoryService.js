import apperService from './ApperService';
import { TABLES } from '../config/apperConfig';
import { CATEGORY_FIELDS } from '../config/tableFields';

class CategoryService {
  // Get all categories
  async getCategories() {
    try {
      const params = {
        fields: CATEGORY_FIELDS,
        orderBy: [{
          field: 'Name',
          direction: 'asc'
        }]
      };
      
      return await apperService.fetchRecords(TABLES.CATEGORY, params);
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  }
  
  // Get category by ID
  async getCategoryById(categoryId) {
    try {
      const params = {
        fields: CATEGORY_FIELDS,
        filter: {
          field: 'Id',
          operator: 'eq',
          value: categoryId
        }
      };
      
      const categories = await apperService.fetchRecords(TABLES.CATEGORY, params);
      return categories.length > 0 ? categories[0] : null;
    } catch (error) {
      console.error(`Error getting category ${categoryId}:`, error);
      throw error;
    }
  }
  
  // Create a new category
  async createCategory(categoryData) {
    try {
      return await apperService.createRecord(TABLES.CATEGORY, {
        record: categoryData
      });
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }
  
  // Update an existing category
  async updateCategory(categoryId, categoryData) {
    try {
      return await apperService.updateRecord(TABLES.CATEGORY, categoryId, {
        record: categoryData
      });
    } catch (error) {
      console.error(`Error updating category ${categoryId}:`, error);
      throw error;
    }
  }
  
  // Delete a category
  async deleteCategory(categoryId) {
    try {
      return await apperService.deleteRecord(TABLES.CATEGORY, categoryId);
    } catch (error) {
      console.error(`Error deleting category ${categoryId}:`, error);
      throw error;
    }
  }
}

// Create singleton instance
const categoryService = new CategoryService();
export default categoryService;