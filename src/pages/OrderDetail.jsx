import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, Calendar, CreditCard, FileText, MapPin } from 'lucide-react';
import orderService from '../services/OrderService';
import { formatDate, formatCurrency } from '../utils/apperUtils';

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch order details
        const orderData = await orderService.getOrderById(id);
        if (!orderData) {
          throw new Error('Order not found');
        }
        setOrder(orderData);
        
        // Fetch order items
        const items = await orderService.getOrderItems(id);
        setOrderItems(items);
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError('Failed to load order details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [id]);
  
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-center py-16">
          <div className="spinner"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }
  
  if (error || !order) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="alert-error">
          <p>{error || 'Order not found'}</p>
          <div className="mt-4 flex space-x-4">
            <button 
              onClick={() => navigate(-1)} 
              className="btn-secondary"
            >
              Go Back
            </button>
            <Link to="/orders" className="btn-primary">
              View All Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Back button */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Orders
      </button>
      
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <FileText className="h-8 w-8 mr-3 text-blue-600" />
        Order {order.order_reference || `#${order.Id}`}
      </h1>
      
      {/* Order Overview */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center mb-2">
              <Calendar className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="font-medium">Order Date</h3>
            </div>
            <p className="text-gray-600">
              {formatDate(order.created_at || order.CreatedOn, 'long')}
            </p>
          </div>
          
          <div>
            <div className="flex items-center mb-2">
              <Truck className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="font-medium">Order Status</h3>
            </div>
            <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full 
              ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 
                'bg-blue-100 text-blue-800'}`}
            >
              {order.status}
            </span>
          </div>
          
          <div>
            <div className="flex items-center mb-2">
              <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="font-medium">Total</h3>
            </div>
            <p className="text-xl font-bold text-gray-800">
              {formatCurrency(order.total_amount)}
            </p>
          </div>
        </div>
      </div>
      
      {/* Shipping Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex items-center mb-4">
            <MapPin className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold">Shipping Information</h2>
          </div>
          
          <div className="space-y-2">
            <p className="font-medium">{order.full_name}</p>
            <p className="text-gray-600">{order.email}</p>
            <p className="text-gray-600">{order.address}</p>
            <p className="text-gray-600">
              {order.city}{order.zip_code ? `, ${order.zip_code}` : ''}
            </p>
            <p className="text-gray-600">{order.country}</p>
          </div>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Package className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold">Order Summary</h2>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatCurrency(order.total_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">Free</span>
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between">
              <span className="font-medium">Total</span>
              <span className="font-bold">{formatCurrency(order.total_amount)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Order Items */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <h2 className="text-lg font-semibold p-6 border-b">Order Items</h2>
        
        {orderItems.length === 0 ? (
          <div className="p-6 text-center text-gray-600">
            No items found for this order.
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orderItems.map((item) => {
                  const product = item.product_id || {};
                  const productPrice = item.price || 0;
                  const itemTotal = productPrice * (item.quantity || 1);
                  
                  return (
                    <tr key={item.Id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img 
                              className="h-10 w-10 object-cover rounded" 
                              src={product.image || "https://via.placeholder.com/100"} 
                              alt={product.Name} 
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.Name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrency(productPrice)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.quantity || 1}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(itemTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderDetail;