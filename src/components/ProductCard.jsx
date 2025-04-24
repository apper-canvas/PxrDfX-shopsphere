import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingCart, Heart } from 'lucide-react';
import { addItem } from '../store/cartSlice';
import { formatCurrency } from '../utils/apperUtils';
import cartService from '../services/CartService';
import userService from '../services/UserService';

function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.user);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  
  // Default image if none provided
  const productImage = product.image || 'https://via.placeholder.com/300x300?text=Product+Image';
  
  // Calculate discount price if applicable
  const discountedPrice = product.discount 
    ? product.price - (product.price * (product.discount / 100)) 
    : null;
  
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setIsAddingToCart(true);
      
      // Create cart item object
      const cartItem = {
        product_id: { Id: product.Id, Name: product.Name },
        quantity: 1,
        price: product.price
      };
      
      // If authenticated, save to database
      if (isAuthenticated) {
        const savedItem = await cartService.addToCart(product.Id, 1);
        dispatch(addItem(savedItem));
      } else {
        // Otherwise just add to Redux state
        dispatch(addItem(cartItem));
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };
  
  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }
    
    try {
      setIsAddingToWishlist(true);
      await userService.addToWishlist(product.Id);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    } finally {
      setIsAddingToWishlist(false);
    }
  };
  
  return (
    <Link to={`/products/${product.Id}`} className="block">
      <div className="card h-full transition-transform hover:shadow-lg hover:-translate-y-1">
        <div className="relative">
          <img 
            src={productImage} 
            alt={product.Name} 
            className="w-full h-48 object-cover"
          />
          
          {product.featured && (
            <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
              Featured
            </span>
          )}
          
          {product.discount > 0 && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              {product.discount}% OFF
            </span>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{product.Name}</h3>
          
          <div className="mt-2 flex justify-between items-center">
            <div>
              {discountedPrice ? (
                <div className="flex items-center">
                  <span className="text-gray-500 line-through mr-2">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="text-lg font-bold text-red-600">
                    {formatCurrency(discountedPrice)}
                  </span>
                </div>
              ) : (
                <span className="text-lg font-bold text-gray-700 dark:text-gray-300">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>
            
            {product.rating && (
              <div className="flex items-center">
                <span className="text-yellow-500">★</span>
                <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                  {product.rating} ({product.reviews || 0})
                </span>
              </div>
            )}
          </div>
          
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {product.description || 'No description available.'}
          </p>
          
          <div className="mt-4 flex space-x-2">
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className="flex items-center justify-center flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded"
            >
              {isAddingToCart ? 'Adding...' : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Add to Cart
                </>
              )}
            </button>
            
            <button
              onClick={handleAddToWishlist}
              disabled={isAddingToWishlist}
              className="flex items-center justify-center py-2 px-3 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded"
            >
              <Heart className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;