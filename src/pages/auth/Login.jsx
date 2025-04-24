import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/userSlice';
import userService from '../../services/UserService';
import cartService from '../../services/CartService';
import { setCartItems } from '../../store/cartSlice';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [authError, setAuthError] = useState(null);
  
  // Get return URL from location state
  const from = location.state?.from || '/dashboard';
  
  useEffect(() => {
    // Initialize ApperUI for authentication
    const ui = userService.setupAuth('#authentication', {
      view: 'login',
      onSuccess: async (user, account) => {
        dispatch(setUser(user.data));
        
        // Fetch cart items after login
        try {
          const cartItems = await cartService.getCartItems();
          dispatch(setCartItems(cartItems));
        } catch (error) {
          console.error('Failed to fetch cart items:', error);
        }
        
        // Navigate to return URL
        navigate(from, { replace: true });
      },
      onError: (error) => {
        console.error('Authentication error:', error);
        setAuthError('Authentication failed. Please try again.');
      }
    });
    
    // Show login form
    ui.showLogin("#authentication");
    
    // Cleanup on unmount
    return () => {
      // Clean up UI if needed
    };
  }, [navigate, dispatch, from]);
  
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">Login to Your Account</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Access your account to manage orders, view your wishlist, and more.
        </p>
      </div>
      
      {authError && (
        <div className="mb-6 alert-error">
          {authError}
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        {/* Authentication container for ApperUI */}
        <div id="authentication" className="min-h-[400px] flex items-center justify-center"></div>
        
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;