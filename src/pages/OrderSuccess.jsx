import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, ShoppingBag, Package } from 'lucide-react';

function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get order details from location state
  const orderId = location.state?.orderId;
  const orderReference = location.state?.orderReference;
  
  useEffect(() => {
    // Redirect to home if no order information is available
    if (!orderId && !orderReference) {
      navigate('/');
    }
  }, [orderId, orderReference, navigate]);
  
  if (!orderId && !orderReference) {
    return null; // Will be redirected by the useEffect
  }
  
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Order Confirmed!</h1>
        
        <p className="mt-2 text-lg text-gray-600">
          Thank you for your purchase. Your order has been received and is being processed.
        </p>
        
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800">Order Details</h2>
          
          <div className="mt-4 text-center">
            <p className="text-gray-700">
              <span className="font-medium">Order Number:</span>{' '}
              {orderReference || `#${orderId}`}
            </p>
            
            <p className="mt-2 text-gray-700">
              <span className="font-medium">Date:</span>{' '}
              {new Date().toLocaleDateString()}
            </p>
          </div>
          
          <div className="mt-6 flex items-center justify-center text-gray-700">
            <Package className="h-5 w-5 mr-2 text-green-600" />
            <p>
              An email confirmation has been sent to your email address.
            </p>
          </div>
        </div>
        
        <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800">What's Next?</h2>
          
          <div className="mt-4 text-gray-600">
            <p className="mb-2">
              Your order is being processed and will be shipped soon. You'll receive tracking information once your order ships.
            </p>
            <p>
              You can view your order status and history in your account dashboard.
            </p>
          </div>
        </div>
        
        <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link 
            to="/orders" 
            className="btn-primary flex items-center justify-center"
          >
            <ShoppingBag className="mr-2 h-5 w-5" />
            View Your Orders
          </Link>
          
          <Link 
            to="/products" 
            className="btn-secondary flex items-center justify-center"
          >
            <Package className="mr-2 h-5 w-5" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;