import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { UserCircle, Mail, Phone, MapPin, Save } from 'lucide-react';
import userService from '../services/UserService';
import { isValidEmail, isValidPhone } from '../utils/apperUtils';

function Profile() {
  const { user, isAuthenticated } = useSelector(state => state.user);
  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  
  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  });
  
  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setIsLoading(true);
        
        if (user && user.emailAddress) {
          const customers = await userService.getCustomerByEmail(user.emailAddress);
          
          if (customers && customers.length > 0) {
            const customerData = customers[0];
            setCustomer(customerData);
            
            // Initialize form data
            setFormData({
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              email: user.emailAddress || customerData.email || '',
              phone: customerData.phone || '',
              address: customerData.address || ''
            });
          } else {
            // Initialize form data with user data only
            setFormData({
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              email: user.emailAddress || '',
              phone: '',
              address: ''
            });
          }
        }
      } catch (error) {
        console.error('Error fetching customer data:', error);
        setError('Failed to load profile data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchCustomerData();
    }
  }, [user, isAuthenticated]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when field is updated
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
    
    // Clear success message
    if (success) {
      setSuccess(null);
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (formData.phone && !isValidPhone(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      
      // Prepare customer data
      const customerData = {
        Name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        address: formData.address
      };
      
      if (customer) {
        // Update existing customer
        await userService.updateCustomer(customer.Id, customerData);
      } else {
        // Create new customer
        await userService.ensureCustomerExists({
          firstName: formData.firstName,
          lastName: formData.lastName,
          emailAddress: formData.email,
          phone: formData.phone
        });
      }
      
      setSuccess('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-center py-16">
          <div className="spinner"></div>
          <p className="mt-4 text-gray-600">Loading profile data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <UserCircle className="h-8 w-8 mr-3 text-blue-600" />
        Your Profile
      </h1>
      
      {error && (
        <div className="alert-error mb-6">
          {error}
        </div>
      )}
      
      {success && (
        <div className="alert-success mb-6">
          {success}
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
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <UserCircle className="h-5 w-5 mr-2 text-blue-600" />
                  Personal Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`form-input ${formErrors.firstName ? 'border-red-500' : ''}`}
                    />
                    {formErrors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`form-input ${formErrors.lastName ? 'border-red-500' : ''}`}
                    />
                    {formErrors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Contact Information */}
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-blue-600" />
                  Contact Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
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
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`form-input ${formErrors.phone ? 'border-red-500' : ''}`}
                    />
                    {formErrors.phone && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Address */}
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                  Address
                </h2>
                
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows="3"
                    value={formData.address}
                    onChange={handleChange}
                    className="form-input"
                  ></textarea>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary flex items-center justify-center"
              >
                {isSaving ? 'Saving...' : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;