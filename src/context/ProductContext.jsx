import { createContext, useState, useEffect } from 'react';
import productService from '../services/ProductService';

// Create the product context
export const ProductContext = createContext(null);

// Product provider component
export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial product data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Fetch featured products
        const featured = await productService.fetchFeaturedProducts();
        setFeaturedProducts(featured);
        
        // Fetch categories
        const allCategories = await productService.fetchCategories();
        setCategories(allCategories);
        
        // Fetch all products (first page)
        const allProducts = await productService.fetchProducts();
        setProducts(allProducts);
        
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Fetch products with filters
  const fetchProducts = async (options = {}) => {
    try {
      setLoading(true);
      const productResults = await productService.fetchProducts(options);
      setProducts(productResults);
      setError(null);
      return productResults;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch products by category
  const fetchProductsByCategory = async (category, limit = 20, offset = 0) => {
    try {
      setLoading(true);
      const productResults = await productService.fetchProductsByCategory(category, limit, offset);
      setProducts(productResults);
      setError(null);
      return productResults;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch a single product by ID
  const fetchProductById = async (productId) => {
    try {
      setLoading(true);
      const product = await productService.fetchProductById(productId);
      setError(null);
      return product;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Search products by name
  const searchProducts = async (query, limit = 20, offset = 0) => {
    try {
      setLoading(true);
      const productResults = await productService.searchProducts(query, limit, offset);
      setProducts(productResults);
      setError(null);
      return productResults;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    products,
    featuredProducts,
    categories,
    loading,
    error,
    fetchProducts,
    fetchProductsByCategory,
    fetchProductById,
    searchProducts
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};