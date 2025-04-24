import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search, FilterX } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import productService from '../services/ProductService';
import categoryService from '../services/CategoryService';
import { CATEGORIES } from '../config/apperConfig';

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(CATEGORIES);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Current filter values
  const currentCategory = searchParams.get('category') || '';
  const currentQuery = searchParams.get('query') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentSort = searchParams.get('sort') || 'newest';
  
  // Pagination
  const productsPerPage = 12;
  const totalPages = Math.ceil(totalProducts / productsPerPage);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await categoryService.getCategories();
        if (fetchedCategories && fetchedCategories.length > 0) {
          // Extract unique category names
          const categoryNames = [...new Set(fetchedCategories.map(cat => cat.Name))];
          setCategories(categoryNames);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to predefined categories in case of error
      }
    };
    
    fetchCategories();
  }, []);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const offset = (currentPage - 1) * productsPerPage;
        
        // Build filter parameters
        const filterParams = {};
        
        if (currentCategory) {
          filterParams.category = currentCategory;
        }
        
        if (currentQuery) {
          filterParams.query = currentQuery;
        }
        
        // Build sort parameters
        let sortField = 'CreatedOn';
        let sortDirection = 'desc';
        
        switch (currentSort) {
          case 'price-low':
            sortField = 'price';
            sortDirection = 'asc';
            break;
          case 'price-high':
            sortField = 'price';
            sortDirection = 'desc';
            break;
          case 'rating':
            sortField = 'rating';
            sortDirection = 'desc';
            break;
          case 'oldest':
            sortField = 'CreatedOn';
            sortDirection = 'asc';
            break;
          default:
            // Newest is default
            break;
        }
        
        const result = await productService.getProducts({
          limit: productsPerPage,
          offset,
          filter: filterParams,
          sortField,
          sortDirection
        });
        
        setProducts(result.items || []);
        setTotalProducts(result.total || 0);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, [currentCategory, currentQuery, currentPage, currentSort]);
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const query = formData.get('query');
    
    // Update URL search params to trigger re-fetch
    setSearchParams({
      ...(currentCategory ? { category: currentCategory } : {}),
      ...(query ? { query } : {}),
      ...(currentSort !== 'newest' ? { sort: currentSort } : {}),
      page: '1' // Reset to first page on new search
    });
  };
  
  const handleCategoryChange = (category) => {
    setSearchParams({
      ...(category ? { category } : {}),
      ...(currentQuery ? { query: currentQuery } : {}),
      ...(currentSort !== 'newest' ? { sort: currentSort } : {}),
      page: '1' // Reset to first page on category change
    });
  };
  
  const handleSortChange = (e) => {
    const sortValue = e.target.value;
    setSearchParams({
      ...(currentCategory ? { category: currentCategory } : {}),
      ...(currentQuery ? { query: currentQuery } : {}),
      ...(sortValue !== 'newest' ? { sort: sortValue } : {}),
      page: currentPage.toString()
    });
  };
  
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    
    setSearchParams({
      ...(currentCategory ? { category: currentCategory } : {}),
      ...(currentQuery ? { query: currentQuery } : {}),
      ...(currentSort !== 'newest' ? { sort: currentSort } : {}),
      page: newPage.toString()
    });
    
    // Scroll to top
    window.scrollTo(0, 0);
  };
  
  const handleClearFilters = () => {
    setSearchParams({});
  };
  
  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };
  
  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">Products</h1>
      
      {/* Mobile filter toggle */}
      <div className="md:hidden mb-4">
        <button
          onClick={toggleFilter}
          className="flex items-center justify-center w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          <SlidersHorizontal className="h-5 w-5 mr-2" />
          {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row">
        {/* Filters sidebar - hidden on mobile unless toggled */}
        <div className={`md:w-64 md:pr-8 mb-6 md:mb-0 ${isFilterOpen ? 'block' : 'hidden md:block'}`}>
          <div className="sticky top-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Filters</h2>
              {(currentCategory || currentQuery) && (
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-red-600 hover:text-red-800 flex items-center"
                >
                  <FilterX className="h-4 w-4 mr-1" />
                  Clear
                </button>
              )}
            </div>
            
            {/* Search form */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Search</h3>
              <form onSubmit={handleSearchSubmit}>
                <div className="flex">
                  <input
                    type="text"
                    name="query"
                    defaultValue={currentQuery}
                    placeholder="Search products..."
                    className="form-input rounded-r-none"
                  />
                  <button 
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-r-md"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </div>
            
            {/* Categories */}
            <div>
              <h3 className="text-lg font-medium mb-2">Categories</h3>
              <div className="space-y-2">
                <div>
                  <button
                    onClick={() => handleCategoryChange('')}
                    className={`w-full text-left px-3 py-1.5 rounded-md ${
                      !currentCategory ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                    }`}
                  >
                    All Categories
                  </button>
                </div>
                
                {categories.map(category => (
                  <div key={category}>
                    <button
                      onClick={() => handleCategoryChange(category)}
                      className={`w-full text-left px-3 py-1.5 rounded-md ${
                        currentCategory === category ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                      }`}
                    >
                      {category}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Products grid */}
        <div className="flex-1">
          {/* Sorting and results info */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <p className="text-gray-600 mb-2 sm:mb-0">
              {isLoading 
                ? 'Loading products...'
                : `Showing ${products.length} of ${totalProducts} products`
              }
            </p>
            
            <div className="flex items-center">
              <label htmlFor="sort" className="mr-2 text-gray-700">Sort by:</label>
              <select
                id="sort"
                value={currentSort}
                onChange={handleSortChange}
                className="form-input py-1"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
          
          {/* Products display */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="spinner"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          ) : error ? (
            <div className="alert-error">
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 btn-primary"
              >
                Try Again
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">
                We couldn't find any products matching your filters.
              </p>
              <button 
                onClick={handleClearFilters}
                className="btn-primary"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard key={product.Id} product={product} />
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {!isLoading && !error && products.length > 0 && totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show pagination around current page
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Products;