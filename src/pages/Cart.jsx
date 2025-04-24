import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingBag, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { setCartItems, updateItem, removeItem, clearCart } from '../store/cartSlice';
import cartService from '../services/CartService';
import { formatCurrency } from '../utils/apperUtils';

function Cart() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, total, count, loading } = useSelector(state => state.cart);
  const { isAuthenticated } = useSelector(state => state.user);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchCartItems = async () => {
      if (!isAuthenticated) {
        // If not authenticated, use cart items from Redux state
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Fetch cart items from API
        const cartItems = await cartService.getCartItems();
        dispatch(setCartItems(cartItems));
      } catch (error) {
        console.error('Error fetching cart items:', error);
        setError('Failed to load cart items. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCartItems();
  }, [dispatch, isAuthenticated]);
  
  const handleUpdateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      if (isAuthenticated) {
        // Update in backend
        await cartService.updateCartItem(id, newQuantity);
      }
      
      // Update in Redux state
      dispatch(updateItem({ id, quantity: newQuantity }));
    } catch (error) {
      console.error('Error updating cart item:', error);
      setError('Failed to update item quantity. Please try again.');
    }
  };
  
  const handleRemoveItem = async (id) => {
    try {
      if (isAuthenticated) {
        // Delete from backend
        await cartService.removeFromCart(id);
      }
      
      // Remove from Redux state
      dispatch(removeItem(id));
    } catch (error) {
      console.error('Error removing cart item:', error);
      setError('Failed to remove item. Please try again.');
    }
  };
  
  const handleClearCart = async () => {
    try {
      if (isAuthenticated) {
        // Clear cart in backend
        await cartService.clearCart();
      }
      
      // Clear Redux state
      dispatch(clearCart());
    } catch (error) {
      console.error('Error clearing cart:', error);
      setError('Failed to clear cart. Please try again.');
    }
  };
  
  const handleProceedToCheckout = () => {
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      // Redirect to login with return URL
      navigate('/login', { state: { from: '/checkout' } });
    }
  };
  
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-center py-16">
          <div className="spinner"></div>
          <p className="mt-4 text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="alert-error">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <ShoppingCart className="h-8 w-8 mr-3 text-blue-600" />
        Shopping Cart
        {count > 0 && <span className="ml-3 text-lg text-gray-600">({count} items)</span>}
      </h1>
      
      {count === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <ShoppingBag className="h-16 w-16 mx-auto text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-700 mt-4">Your cart is empty</h2>
          <p className="text-gray-600 mt-2 mb-6">
            It looks like you haven't added any products to your cart yet.
          </p>
          <Link to="/products" className="btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => {
                    const product = item.product_id || {};
                    const productPrice = item.price || 0;
                    const itemTotal = productPrice * (item.quantity || 1);
                    
                    return (
                      <tr key={item.Id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-16 w-16">
                              <img 
                                className="h-16 w-16 object-cover rounded" 
                                src={product.image || "https://via.placeholder.com/150"} 
                                alt={product.Name} 
                              />
                            </div>
                            <div className="ml-4">
                              <Link 
                                to={`/products/${product.Id}`} 
                                className="text-lg font-medium text-gray-900 hover:text-blue-600"
                              >
                                {product.Name}
                              </Link>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatCurrency(productPrice)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <button
                              onClick={() => handleUpdateQuantity(item.Id, (item.quantity || 1) - 1)}
                              disabled={item.quantity <= 1}
                              className="text-gray-500 hover:text-gray-700 p-1"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity || 1}
                              onChange={(e) => handleUpdateQuantity(item.Id, parseInt(e.target.value, 10))}
                              className="mx-2 w-12 text-center border border-gray-300 rounded"
                            />
                            <button
                              onClick={() => handleUpdateQuantity(item.Id, (item.quantity || 1) + 1)}
                              className="text-gray-500 hover:text-gray-700 p-1"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(itemTotal)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleRemoveItem(item.Id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
                <button
                  onClick={handleClearCart}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Clear Cart
                </button>
                <Link to="/products" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
          
          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">Free</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-lg font-bold">{formatCurrency(total)}</span>
                </div>
              </div>
              
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md flex items-center justify-center"
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              
              <div className="mt-6 text-center text-sm text-gray-600">
                <p>We accept:</p>
                <div className="flex justify-center space-x-2 mt-2">
                  <span className="font-medium">Visa</span>
                  <span className="font-medium">MasterCard</span>
                  <span className="font-medium">PayPal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;