import { Link } from 'react-router-dom';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-gray-300 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">ShopSphere</h3>
            <p className="text-sm">
              Your one-stop shop for quality products at amazing prices.
              Discover a world of options and shop with confidence.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/products" className="hover:text-white">All Products</Link>
              </li>
              <li>
                <Link to="/products?category=Electronics" className="hover:text-white">Electronics</Link>
              </li>
              <li>
                <Link to="/products?category=Furniture" className="hover:text-white">Furniture</Link>
              </li>
              <li>
                <Link to="/products?category=Fashion" className="hover:text-white">Fashion</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Account</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/login" className="hover:text-white">Login</Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-white">Register</Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white">Cart</Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-white">Orders</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>Email: support@shopsphere.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Address: 123 Commerce St, Market City</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-4 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">&copy; {currentYear} ShopSphere. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-sm hover:text-white">Privacy Policy</a>
            <a href="#" className="text-sm hover:text-white">Terms of Service</a>
            <a href="#" className="text-sm hover:text-white">Shipping Info</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;