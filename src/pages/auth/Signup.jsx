import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/userSlice';
import userService from '../../services/UserService';

function Signup() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [authError, setAuthError] = useState(null);
  
  useEffect(() => {
    // Initialize ApperUI for authentication
    const ui = userService.setupAuth('#authentication', {
      view: 'signup',
      onSuccess: (user, account) => {
        dispatch(setUser(user.data));
        
        // Navigate to dashboard after successful signup
        navigate('/dashboard', { replace: true });
      },
      onError: (error) => {
        console.error('Authentication error:', error);
        setAuthError('Registration failed. Please try again.');
      }
    });
    
    // Show signup form
    ui.showSignup("#authentication");
    
    // Cleanup on unmount
    return () => {
      // Clean up UI if needed
    };
  }, [navigate, dispatch]);
  
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">Create Your Account</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Sign up to start shopping, track orders, and get personalized recommendations.
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
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;