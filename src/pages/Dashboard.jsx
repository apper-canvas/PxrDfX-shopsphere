import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Package, ShoppingBag, User, Heart } from 'lucide-react';
import orderService from '../services/OrderService';
import productService from '../services/ProductService';
import userService from '../services/UserService';
import { formatDate, formatCurrency } from '../utils/apperUtils';

function Dashboard() {
  const { user } = useSelector(state => state.user);
  const [recentOrders, setRecentOrders] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch recent orders
        const orders = await orderService.getOrders({ limit: 5 });
        setRecentOrders(orders);
        
        // Fetch featured products
        const products = await productService.getProducts({ 
          filter: { field: 'featured', operator: 'eq', value: true },
          limit: 4
        });
        setFeaturedProducts(products);
        
        // Fetch wishlist items
        if (user && user.Id) {
          const wishlist = await userService.fetchWishlistItems(user.Id);
          setWishlistItems(wishlist);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);
  
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="text-center py-16">
          <div className="spinner"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      {/* Welcome Section */}
      <div className="bg-blue-600 text-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold">Welcome back, {user?.firstName || 'Shopper'}!</h1>
        <p className="mt-2">Here's an overview of your recent activity and featured products.</p>
      </div>
      
      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <User className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-xl font-bold">My Profile</h2>
          </div>
          
          <div className="space-y-3">
            <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
            <p><strong>Email:</strong> {user?.emailAddress}</p>
            <p><strong>Member since:</strong> {formatDate(user?.CreatedOn, 'long')}</p>
          </div>
          
          <div className="mt-4">
            <Link 
              to="/profile" 
              className="block w-full btn-primary text-center"
            >
              Manage Profile
            </Link>
          </div>
        </div>
        
        {/* Recent Orders Card */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <ShoppingBag className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-xl font-bold">Recent Orders</h2>
          </div>
          
          {recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map(order => (
                <div key={order.Id} className="flex justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{order.order_reference || `Order #${order.Id}`}</p>
                    <p className="text-sm text-gray-600">{formatDate(order.CreatedOn)}</p>
                  </div>
                  <div>
                    <p className="font-bold text-right">{formatCurrency(order.total_amount)}</p>
                    <p className="text-sm text-right">
                      <span className={`
                        px-2 py-1 rounded text-xs
                        ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                          order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 
                          'bg-blue-100 text-blue-800'}
                      `}>
                        {order.status}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">You haven't placed any orders yet.</p>
          )}
          
          <div className="mt-4">
            <Link 
              to="/orders" 
              className="block w-full btn-primary text-center"
            >
              View All Orders
            </Link>
          </div>
        </div>
        
        {/* Wishlist Card */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <Heart className="h-8 w-8 text-red-600 mr-3" />
            <h2 className="text-xl font-bold">My Wishlist</h2>
          </div>
          
          {wishlistItems.length > 0 ? (
            <div className="space-y-3">
              {wishlistItems.map(item => (
                <div key={item.Id} className="flex justify-between border-b pb-2">
                  <p>{item.product_id?.Name || 'Product'}</p>
                  <Link to={`/products/${item.product_id?.Id}`} className="text-blue-600 hover:text-blue-800">
                    View
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Your wishlist is empty.</p>
          )}
          
          <div className="mt-4">
            <Link 
              to="/products" 
              className="block w-full btn-primary text-center"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
      
      {/* Featured Products Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Featured Products</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {featuredProducts.map(product => (
            <div key={product.Id} className="card overflow-hidden">
              <Link to={`/products/${product.Id}`}>
                <img 
                  src={product.image || "https://via.placeholder.com/300x200"} 
                  alt={product.Name} 
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold">{product.Name}</h3>
                  <p className="text-blue-600 font-bold mt-1">{formatCurrency(product.price)}</p>
                  <p className="text-sm text-gray-600 line-clamp-2 mt-2">{product.description}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;