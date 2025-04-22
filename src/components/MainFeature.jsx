import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Trash2, Plus, Minus, X, ShoppingBag, ArrowRight } from "lucide-react";

function MainFeature() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(0); // 0: cart, 1: shipping, 2: payment, 3: confirmation
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
    country: "",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: ""
  });
  const [formErrors, setFormErrors] = useState({});
  
  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
    
    // Listen for storage events (when cart is updated from other components)
    const handleStorageChange = () => {
      const updatedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCart(updatedCart);
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);
  
  // Update quantity function
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cart.map(item => 
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("storage"));
  };
  
  // Remove from cart function
  const removeFromCart = (productId) => {
    const updatedCart = cart.filter(item => item.id !== productId);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("storage"));
  };
  
  // Clear cart function
  const clearCart = () => {
    setCart([]);
    localStorage.setItem("cart", JSON.stringify([]));
    window.dispatchEvent(new Event("storage"));
  };
  
  // Calculate total price
  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const itemPrice = item.discount 
        ? item.price - (item.price * item.discount / 100) 
        : item.price;
      return total + (itemPrice * item.quantity);
    }, 0).toFixed(2);
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ""
      });
    }
  };
  
  // Validate form based on current step
  const validateForm = () => {
    const errors = {};
    
    if (checkoutStep === 1) {
      // Shipping info validation
      if (!formData.fullName.trim()) errors.fullName = "Name is required";
      if (!formData.email.trim()) {
        errors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = "Email is invalid";
      }
      if (!formData.address.trim()) errors.address = "Address is required";
      if (!formData.city.trim()) errors.city = "City is required";
      if (!formData.zipCode.trim()) errors.zipCode = "Zip code is required";
      if (!formData.country.trim()) errors.country = "Country is required";
    } else if (checkoutStep === 2) {
      // Payment info validation
      if (!formData.cardNumber.trim()) {
        errors.cardNumber = "Card number is required";
      } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ""))) {
        errors.cardNumber = "Card number must be 16 digits";
      }
      
      if (!formData.cardName.trim()) errors.cardName = "Name on card is required";
      
      if (!formData.expiryDate.trim()) {
        errors.expiryDate = "Expiry date is required";
      } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
        errors.expiryDate = "Format must be MM/YY";
      }
      
      if (!formData.cvv.trim()) {
        errors.cvv = "CVV is required";
      } else if (!/^\d{3,4}$/.test(formData.cvv)) {
        errors.cvv = "CVV must be 3 or 4 digits";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle next step
  const handleNextStep = () => {
    if (validateForm()) {
      if (checkoutStep === 2) {
        // Process order (in a real app, this would send data to a server)
        // For demo purposes, we'll just move to confirmation and clear the cart
        setTimeout(() => {
          clearCart();
          setCheckoutStep(3);
        }, 1000);
      } else {
        setCheckoutStep(checkoutStep + 1);
      }
    }
  };
  
  // Handle previous step
  const handlePrevStep = () => {
    setCheckoutStep(checkoutStep - 1);
  };
  
  // Reset checkout
  const resetCheckout = () => {
    setCheckoutStep(0);
    setIsCartOpen(false);
    setFormData({
      fullName: "",
      email: "",
      address: "",
      city: "",
      zipCode: "",
      country: "",
      cardNumber: "",
      cardName: "",
      expiryDate: "",
      cvv: ""
    });
    setFormErrors({});
  };
  
  // Render step content
  const renderStepContent = () => {
    switch (checkoutStep) {
      case 0: // Cart
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Your Cart</h3>
              {cart.length > 0 && (
                <button 
                  onClick={clearCart}
                  className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-1"
                >
                  <Trash2 size={14} />
                  Clear All
                </button>
              )}
            </div>
            
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-surface-100 dark:bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag size={24} className="text-surface-400" />
                </div>
                <h4 className="text-lg font-medium mb-2">Your cart is empty</h4>
                <p className="text-surface-500 dark:text-surface-400 mb-4">
                  Looks like you haven't added anything to your cart yet.
                </p>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="btn-primary"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="max-h-[300px] overflow-y-auto scrollbar-hide mb-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 py-3 border-b border-surface-200 dark:border-surface-700">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      
                      <div className="flex-grow">
                        <h4 className="font-medium">{item.name}</h4>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 rounded-full bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>
                            
                            <span className="w-8 text-center">{item.quantity}</span>
                            
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 rounded-full bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700"
                              aria-label="Increase quantity"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className="font-medium">
                              ${((item.discount ? (item.price - (item.price * item.discount / 100)) : item.price) * item.quantity).toFixed(2)}
                            </span>
                            
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-500 hover:text-red-600"
                              aria-label={`Remove ${item.name} from cart`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-surface-200 dark:border-surface-700 pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-surface-600 dark:text-surface-400">Subtotal</span>
                    <span className="font-medium">${calculateTotal()}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="text-surface-600 dark:text-surface-400">Shipping</span>
                    <span className="font-medium">Free</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold mb-6">
                    <span>Total</span>
                    <span>${calculateTotal()}</span>
                  </div>
                  
                  <button 
                    onClick={handleNextStep}
                    className="btn-primary w-full"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        );
        
      case 1: // Shipping
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Shipping Information</h3>
              <button 
                onClick={() => setCheckoutStep(0)}
                className="text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
              >
                <X size={20} />
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`input ${formErrors.fullName ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {formErrors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`input ${formErrors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {formErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="address" className="block text-sm font-medium mb-1">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`input ${formErrors.address ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {formErrors.address && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`input ${formErrors.city ? 'border-red-500 focus:ring-red-500' : ''}`}
                  />
                  {formErrors.city && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium mb-1">Zip Code</label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className={`input ${formErrors.zipCode ? 'border-red-500 focus:ring-red-500' : ''}`}
                  />
                  {formErrors.zipCode && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.zipCode}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="country" className="block text-sm font-medium mb-1">Country</label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className={`input ${formErrors.country ? 'border-red-500 focus:ring-red-500' : ''}`}
                >
                  <option value="">Select a country</option>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="UK">United Kingdom</option>
                  <option value="AU">Australia</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                </select>
                {formErrors.country && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.country}</p>
                )}
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="btn-outline flex-1"
                >
                  Back to Cart
                </button>
                
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="btn-primary flex-1"
                >
                  Continue to Payment
                </button>
              </div>
            </form>
          </div>
        );
        
      case 2: // Payment
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Payment Information</h3>
              <button 
                onClick={() => setCheckoutStep(0)}
                className="text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
              >
                <X size={20} />
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label htmlFor="cardNumber" className="block text-sm font-medium mb-1">Card Number</label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  className={`input ${formErrors.cardNumber ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {formErrors.cardNumber && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.cardNumber}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="cardName" className="block text-sm font-medium mb-1">Name on Card</label>
                <input
                  type="text"
                  id="cardName"
                  name="cardName"
                  value={formData.cardName}
                  onChange={handleInputChange}
                  className={`input ${formErrors.cardName ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {formErrors.cardName && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.cardName}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expiryDate" className="block text-sm font-medium mb-1">Expiry Date</label>
                  <input
                    type="text"
                    id="expiryDate"
                    name="expiryDate"
                    placeholder="MM/YY"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className={`input ${formErrors.expiryDate ? 'border-red-500 focus:ring-red-500' : ''}`}
                  />
                  {formErrors.expiryDate && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.expiryDate}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="cvv" className="block text-sm font-medium mb-1">CVV</label>
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    placeholder="123"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    className={`input ${formErrors.cvv ? 'border-red-500 focus:ring-red-500' : ''}`}
                  />
                  {formErrors.cvv && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.cvv}</p>
                  )}
                </div>
              </div>
              
              <div className="border-t border-surface-200 dark:border-surface-700 mt-6 pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-surface-600 dark:text-surface-400">Subtotal</span>
                  <span className="font-medium">${calculateTotal()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-surface-600 dark:text-surface-400">Shipping</span>
                  <span className="font-medium">Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold mb-6">
                  <span>Total</span>
                  <span>${calculateTotal()}</span>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="btn-outline flex-1"
                >
                  Back
                </button>
                
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="btn-primary flex-1"
                >
                  Place Order
                </button>
              </div>
            </form>
          </div>
        );
        
      case 3: // Confirmation
        return (
          <div className="text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            
            <h3 className="text-2xl font-bold mb-4">Order Confirmed!</h3>
            
            <p className="text-surface-600 dark:text-surface-400 mb-6">
              Thank you for your purchase. Your order has been received and is being processed.
              You will receive an email confirmation shortly.
            </p>
            
            <div className="bg-surface-100 dark:bg-surface-800 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium">Order Reference: <span className="font-bold">ORD-{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</span></p>
            </div>
            
            <button 
              onClick={resetCheckout}
              className="btn-primary"
            >
              Continue Shopping
            </button>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <h3 className="text-2xl font-bold mb-4">Your Shopping Cart</h3>
          <p className="text-surface-600 dark:text-surface-400 mb-6">
            Manage your shopping cart, review items, and proceed to checkout with our seamless cart experience.
          </p>
          
          <div className="bg-white dark:bg-surface-800 rounded-xl shadow-card p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center text-primary">
                <ShoppingCart size={24} />
              </div>
              <div>
                <h4 className="font-bold">Cart Summary</h4>
                <p className="text-surface-500 dark:text-surface-400 text-sm">
                  {cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart
                </p>
              </div>
            </div>
            
            {cart.length > 0 ? (
              <>
                <div className="space-y-3 mb-4">
                  {cart.slice(0, 2).map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div className="flex-grow">
                        <h5 className="text-sm font-medium truncate">{item.name}</h5>
                        <p className="text-xs text-surface-500 dark:text-surface-400">
                          Qty: {item.quantity} × ${(item.discount ? (item.price - (item.price * item.discount / 100)) : item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {cart.length > 2 && (
                    <p className="text-sm text-surface-500 dark:text-surface-400 text-center">
                      +{cart.length - 2} more {cart.length - 2 === 1 ? 'item' : 'items'}
                    </p>
                  )}
                </div>
                
                <div className="border-t border-surface-200 dark:border-surface-700 pt-3 mb-4">
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>${calculateTotal()}</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-center text-surface-500 dark:text-surface-400 my-4">
                Your cart is empty
              </p>
            )}
            
            <button 
              onClick={() => setIsCartOpen(true)}
              className="btn-primary w-full flex items-center justify-center gap-2"
              disabled={cart.length === 0}
            >
              <ShoppingCart size={18} />
              {cart.length > 0 ? 'View Cart & Checkout' : 'Start Shopping'}
            </button>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Secure checkout with encrypted payment processing</span>
          </div>
        </div>
        
        <div className="relative">
          <img 
            src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
            alt="Shopping cart illustration" 
            className="w-full h-auto rounded-xl shadow-xl"
          />
          
          {/* Floating elements */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="absolute -top-4 -right-4 bg-white dark:bg-surface-800 rounded-lg shadow-soft p-3 flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-medium">Secure Checkout</span>
          </motion.div>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="absolute -bottom-4 -left-4 bg-white dark:bg-surface-800 rounded-lg shadow-soft p-3 flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-medium">Fast Delivery</span>
          </motion.div>
        </div>
      </div>
      
      {/* Cart Modal */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-surface-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => checkoutStep === 0 && setIsCartOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-surface-900 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 overflow-y-auto max-h-[90vh]">
                {renderStepContent()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MainFeature;