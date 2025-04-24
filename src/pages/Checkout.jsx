import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { CreditCard, Truck, ShoppingBag } from 'lucide-react';
import { clearCart } from '../store/cartSlice';
import orderService from '../services/OrderService';
import cartService from '../services/CartService';
import userService from '../services/UserService';
import { formatCurrency, isValidEmail, isValidPhone } from '../utils/apperUtils';
import { COUNTRIES } from '../config/apperConfig';

function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, total } = useSelector(state => state.cart);
  const { user, isAuthenticated } = useSelector(state => state.user);
  
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  
  // Form data
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    address: '',
    city: '',
    zip_code: '',
    country: 'US',
    payment_method: 'credit_card',
    card_number: '',
    card_expiry: '',
    card_cvv: ''
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        if (!isAuthenticated) {
          navigate('/login', { state: { from: '/checkout' } });
          return;
        }
        
        if (items.length === 0) {
          navigate('/cart');
          return;
        }
        
        // Fetch customer data if authenticated
        if (user && user.emailAddress) {
          const customers = await userService.getCustomerByEmail(user.emailAddress);
          
          if (customers && customers.length > 0) {
            const customerData = customers[0];
            setCustomer(customerData);
            
            // Pre-fill form with customer data
            setFormData(prevData => ({
              ...prevData,
              full_name: customerData.Name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
              email: customerData.email || user.emailAddress || '',
              address: customerData.address || '',
              phone: customerData.phone || ''
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching checkout data:', error);
        setError('Failed to load checkout data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [navigate, isAuthenticated, user, items]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when field is updated
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.full_name.trim()) {
      errors.full_name = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    }
    
    if (!formData.city.trim()) {
      errors.city = 'City is required';
    }
    
    if (!formData.zip_code.trim()) {
      errors.zip_code = 'ZIP/Postal code is required';
    }
    
    if (formData.payment_method === 'credit_card') {
      if (!formData.card_number.trim()) {
        errors.card_number = 'Card number is required';
      } else if (!/^\d{16}$/.test(formData.card_number.replace(/\s/g, ''))) {
        errors.card_number = 'Please enter a valid card number';
      }
      
      if (!formData.card_expiry.trim()) {
        errors.card_expiry = 'Expiry date is required';
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.card_expiry)) {
        errors.card_expiry = 'Please use format MM/YY';
      }
      
      if (!formData.card_cvv.trim()) {
        errors.card_cvv = 'Security code is required';
      } else if (!/^\d{3,4}$/.test(formData.card_cvv)) {
        errors.card_cvv = 'Please enter a valid security code';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      window.scrollTo(0, 0);
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Generate a unique order reference
      const orderReference = 'ORD-' + Date.now().toString().slice(-6);
      
      // Prepare order data
      const orderData = {
        order_reference: orderReference,
        full_name: formData.full_name,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        zip_code: formData.zip_code,
        country: formData.country,
        total_amount: total,
        status: 'Pending',
        created_at: new Date().toISOString()
      };
      
      // Create order
      const createdOrder = await orderService.createOrder(orderData);
      
      // Create order items from cart items
      for (const item of items) {
        const orderItem = {
          order_id: { Id: createdOrder.Id },
          product_id: { Id: item.product_id.Id },
          quantity: item.quantity,
          price: item.price
        };
        
        await orderService.createOrderItem(orderItem);
      }
      
      // Update or create customer data if needed
      if (customer) {
        const customerData = {
          Name: formData.full_name,
          email: formData.email,
          address: formData.address,
          phone: formData.phone || customer.phone
        };
        
        await userService.updateCustomer(customer.Id, customerData);
      }
      
      // Clear cart
      if (isAuthenticated) {
        await cartService.clearCart();
      }
      dispatch(clearCart());
      
      // Navigate to success page with order ID
      navigate('/order-success', { 
        state: { 
          orderId: createdOrder.Id,
          orderReference
        } 
      });
    } catch (error) {
      console.error('Error creating order:', error);
      setError('Failed to process your order. Please try again.');
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-center py-16">
          <div className="spinner"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      
      {error && (
        <div className="alert-error mb-6">
          {error}
        </div>
      )}
      
      {Object.keys(formErrors).length > 0 && (
        <div className="alert-error mb-6">
          <p className="font-bold">Please correct the following errors:</p>
          <ul className="mt-2 list-disc pl-5">
            {Object.entries(formErrors).map(([field, message]) => (
              <li key={field}>{message}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            {/* Shipping Information */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <div className="flex items-center mb-4">
                <Truck className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold">Shipping Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className={`form-input ${formErrors.full_name ? 'border-red-500' : ''}`}
                  />
                  {formErrors.full_name && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.full_name}</p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`form-input ${formErrors.email ? 'border-red-500' : ''}`}
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`form-input ${formErrors.address ? 'border-red-500' : ''}`}
                  />
                  {formErrors.address && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`form-input ${formErrors.city ? 'border-red-500' : ''}`}
                  />
                  {formErrors.city && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.city}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP / Postal Code
                  </label>
                  <input
                    type="text"
                    id="zip_code"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleChange}
                    className={`form-input ${formErrors.zip_code ? 'border-red-500' : ''}`}
                  />
                  {formErrors.zip_code && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.zip_code}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="form-input"
                  >
                    {COUNTRIES.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>
            </div>
            
            {/* Payment Information */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <div className="flex items-center mb-4">
                <CreditCard className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold">Payment Method</h2>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="payment_method"
                      value="credit_card"
                      checked={formData.payment_method === 'credit_card'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    Credit Card
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="payment_method"
                      value="paypal"
                      checked={formData.payment_method === 'paypal'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    PayPal
                  </label>
                </div>
              </div>
              
              {formData.payment_method === 'credit_card' && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="card_number" className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      id="card_number"
                      name="card_number"
                      placeholder="1234 5678 9012 3456"
                      value={formData.card_number}
                      onChange={handleChange}
                      className={`form-input ${formErrors.card_number ? 'border-red-500' : ''}`}
                    />
                    {formErrors.card_number && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.card_number}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="card_expiry" className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date (MM/YY)
                      </label>
                      <input
                        type="text"
                        id="card_expiry"
                        name="card_expiry"
                        placeholder="MM/YY"
                        value={formData.card_expiry}
                        onChange={handleChange}
                        className={`form-input ${formErrors.card_expiry ? 'border-red-500' : ''}`}
                      />
                      {formErrors.card_expiry && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.card_expiry}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="card_cvv" className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        id="card_cvv"
                        name="card_cvv"
                        placeholder="123"
                        value={formData.card_cvv}
                        onChange={handleChange}
                        className={`form-input ${formErrors.card_cvv ? 'border-red-500' : ''}`}
                      />
                      {formErrors.card_cvv && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.card_cvv}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {formData.payment_method === 'paypal' && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-700">
                    You will be redirected to PayPal to complete your payment after placing the order.
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md"
              >
                {isSubmitting ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </form>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-md rounded-lg p-6 sticky top-6">
            <div className="flex items-center mb-4">
              <ShoppingBag className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold">Order Summary</h2>
            </div>
            
            <div className="divide-y">
              {items.map((item) => {
                const product = item.product_id || {};
                const productPrice = item.price || 0;
                const itemTotal = productPrice * (item.quantity || 1);
                
                return (
                  <div key={item.Id} className="py-3 flex justify-between">
                    <div>
                      <p className="font-medium">{product.Name}</p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity || 1} x {formatCurrency(productPrice)}
                      </p>
                    </div>
                    <div className="font-medium">
                      {formatCurrency(itemTotal)}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="border-t mt-4 pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">{formatCurrency(0)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;