import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingCart, Heart, ArrowLeft, Truck, ShieldCheck, Clock } from 'lucide-react';
import { addItem } from '../store/cartSlice';
import productService from '../services/ProductService';
import cartService from '../services/CartService';
import userService from '../services/UserService';
import { formatCurrency } from '../utils/apperUtils';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.user);
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [addToCartSuccess, setAddToCartSuccess] = useState(false);
  
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Reset success message when viewing a new product
        setAddToCartSuccess(false);
        
        const fetchedProduct = await productService.getProductById(id);
        if (!fetchedProduct) {
          throw new Error('Product not found');
        }
        
        setProduct(fetchedProduct);
        
        // Fetch related products from the same category
        if (fetchedProduct.category) {
          const related = await productService.getProducts({
            filter: {
              field: 'category',
              operator: 'eq',
              value: fetchedProduct.category
            },
            limit: 4,
            excludeIds: [fetchedProduct.Id]
          });
          
          setRelatedProducts(related.items || []);
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        setError('Failed to load product details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProductDetails();
  }, [id]);
  
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setQuantity(value > 0 ? value : 1);
  };
  
  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true);
      
      // Create cart item object
      const cartItem = {
        product_id: { Id: product.Id, Name: product.Name },
        quantity,
        price: product.price
      };
      
      // If authenticated, save to database
      if (isAuthenticated) {
        const savedItem = await cartService.addToCart(product.Id, quantity);
        dispatch(addItem(savedItem));
      } else {
        // Otherwise just add to Redux state
        dispatch(addItem(cartItem));
      }
      
      setAddToCartSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setAddToCartSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError('Failed to add to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };
  
  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }
    
    try {
      setIsAddingToWishlist(true);
      await userService.addToWishlist(product.Id);
      // Show success feedback (could add a state for this if needed)
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      setError('Failed to add to wishlist. Please try again.');
    } finally {
      setIsAddingToWishlist(false);
    }
  };
  
  const handleBuyNow = async () => {
    try {
      setIsAddingToCart(true);
      
      // Add to cart first (same as handleAddToCart)
      const cartItem = {
        product_id: { Id: product.Id, Name: product.Name },
        quantity,
        price: product.price
      };
      
      if (isAuthenticated) {
        const savedItem = await cartService.addToCart(product.Id, quantity);
        dispatch(addItem(savedItem));
      } else {
        dispatch(addItem(cartItem));
      }
      
      // Then navigate to checkout
      navigate('/checkout');
    } catch (error) {
      console.error('Error processing buy now:', error);
      setError('Failed to process purchase. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-center py-16">
          <div className="spinner"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="alert-error">
          <p>{error || 'Product not found'}</p>
          <div className="mt-4 flex space-x-4">
            <button 
              onClick={() => navigate(-1)} 
              className="btn-secondary"
            >
              Go Back
            </button>
            <Link to="/products" className="btn-primary">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Calculate discount price if applicable
  const discountedPrice = product.discount 
    ? product.price - (product.price * (product.discount / 100)) 
    : null;
  
  const actualPrice = discountedPrice || product.price;
  
  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="flex items-center mb-4 text-sm">
        <Link to="/products" className="text-blue-600 hover:text-blue-800">
          Products
        </Link>
        <span className="mx-2 text-gray-500">/</span>
        {product.category && (
          <>
            <Link 
              to={`/products?category=${encodeURIComponent(product.category)}`}
              className="text-blue-600 hover:text-blue-800"
            >
              {product.category}
            </Link>
            <span className="mx-2 text-gray-500">/</span>
          </>
        )}
        <span className="text-gray-600">{product.Name}</span>
      </div>
      
      {/* Back button */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back
      </button>
      
      {/* Success message */}
      {addToCartSuccess && (
        <div className="alert-success mb-4">
          Product added to cart successfully!
        </div>
      )}
      
      {/* Product Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="bg-white rounded-lg overflow-hidden shadow-md">
          <img 
            src={product.image || "https://via.placeholder.com/600x600?text=Product+Image"} 
            alt={product.Name} 
            className="w-full h-auto object-cover"
          />
        </div>
        
        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.Name}</h1>
          
          {product.featured && (
            <span className="inline-block mt-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
              Featured
            </span>
          )}
          
          {/* Pricing */}
          <div className="mt-4">
            {discountedPrice ? (
              <div className="flex items-center">
                <span className="text-3xl font-bold text-red-600 mr-3">
                  {formatCurrency(discountedPrice)}
                </span>
                <span className="text-lg text-gray-500 line-through">
                  {formatCurrency(product.price)}
                </span>
                <span className="ml-3 bg-red-100 text-red-800 text-sm font-semibold px-2 py-1 rounded">
                  {product.discount}% OFF
                </span>
              </div>
            ) : (
              <span className="text-3xl font-bold text-gray-900">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
          
          {/* Rating */}
          {product.rating && (
            <div className="flex items-center mt-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < Math.floor(product.rating) ? "text-yellow-500" : "text-gray-300"}>
                    ★
                  </span>
                ))}
              </div>
              <span className="ml-2 text-gray-600">
                {product.rating} ({product.reviews || 0} reviews)
              </span>
            </div>
          )}
          
          {/* Description */}
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">
              {product.description || 'No description available.'}
            </p>
          </div>
          
          {/* Purchase Options */}
          <div className="mt-6 border-t border-gray-200 pt-4">
            <div className="flex items-center mb-4">
              <label htmlFor="quantity" className="mr-4 font-medium">Quantity:</label>
              <input
                type="number"
                id="quantity"
                min="1"
                value={quantity}
                onChange={handleQuantityChange}
                className="form-input w-16 text-center"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="flex-1 btn-primary flex items-center justify-center"
              >
                {isAddingToCart ? 'Adding...' : (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Add to Cart
                  </>
                )}
              </button>
              
              <button
                onClick={handleBuyNow}
                disabled={isAddingToCart}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
              >
                Buy Now
              </button>
              
              <button
                onClick={handleAddToWishlist}
                disabled={isAddingToWishlist}
                className="btn-secondary flex items-center justify-center"
              >
                <Heart className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Product Details */}
          <div className="mt-6 border-t border-gray-200 pt-4">
            <h2 className="text-lg font-semibold mb-3">Product Details</h2>
            <div className="space-y-3">
              {product.category && (
                <div className="flex">
                  <span className="w-32 text-gray-600">Category:</span>
                  <span className="font-medium">{product.category}</span>
                </div>
              )}
              
              <div className="flex">
                <span className="w-32 text-gray-600">Availability:</span>
                <span className={`font-medium ${
                  product.inStock ? 'text-green-600' : 'text-red-600'
                }`}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              
              {product.CreatedOn && (
                <div className="flex">
                  <span className="w-32 text-gray-600">Added on:</span>
                  <span className="font-medium">
                    {new Date(product.CreatedOn).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Shipping & Returns */}
          <div className="mt-6 border-t border-gray-200 pt-4">
            <h2 className="text-lg font-semibold mb-3">Shipping & Returns</h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <Truck className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                <span>Free shipping on orders over $50</span>
              </div>
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                <span>Delivery within 3-5 business days</span>
              </div>
              <div className="flex items-start">
                <ShieldCheck className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                <span>30-day money-back guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map(relatedProduct => (
              <div key={relatedProduct.Id} className="card overflow-hidden">
                <Link to={`/products/${relatedProduct.Id}`}>
                  <img 
                    src={relatedProduct.image || "https://via.placeholder.com/300x200"}
                    alt={relatedProduct.Name} 
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-bold">{relatedProduct.Name}</h3>
                    <p className="text-blue-600 font-bold mt-1">
                      {formatCurrency(relatedProduct.price)}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetail;