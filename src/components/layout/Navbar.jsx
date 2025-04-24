import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingCart, User, Menu, X, LogOut, Package, Home, ShoppingBag } from 'lucide-react';
import { clearUser } from '../../store/userSlice';
import { clearCart } from '../../store/cartSlice';
import userService from '../../services/UserService';

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const { isAuthenticated, user } = useSelector(state => state.user);
  const { count: cartCount } = useSelector(state => state.cart);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    userService.logout();
    dispatch(clearUser());
    dispatch(clearCart());
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 font-bold text-xl">
              ShopSphere
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block ml-10">
              <div className="flex items-center space-x-4">
                <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  <Home className="inline-block mr-1 h-4 w-4" />
                  Home
                </Link>
                <Link to="/products" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  <Package className="inline-block mr-1 h-4 w-4" />
                  Products
                </Link>
                {isAuthenticated && (
                  <Link to="/orders" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                    <ShoppingBag className="inline-block mr-1 h-4 w-4" />
                    Orders
                  </Link>
                )}
              </div>
            </div>
          </div>
          
          {/* Desktop Right Menu */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <Link to="/cart" className="relative px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                <ShoppingCart className="inline-block h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              
              {isAuthenticated ? (
                <div className="relative group">
                  <button className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                    <User className="inline-block mr-1 h-5 w-5" />
                    {user?.firstName || 'Account'}
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                    <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Dashboard</Link>
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</Link>
                    <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Orders</Link>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  <User className="inline-block mr-1 h-5 w-5" />
                  Login
                </Link>
              )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Link to="/cart" className="relative mr-4">
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-700 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700" onClick={() => setIsMenuOpen(false)}>
              <Home className="inline-block mr-2 h-4 w-4" />
              Home
            </Link>
            <Link to="/products" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700" onClick={() => setIsMenuOpen(false)}>
              <Package className="inline-block mr-2 h-4 w-4" />
              Products
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700" onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link to="/orders" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700" onClick={() => setIsMenuOpen(false)}>
                  <ShoppingBag className="inline-block mr-2 h-4 w-4" />
                  Orders
                </Link>
                <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700" onClick={() => setIsMenuOpen(false)}>
                  <User className="inline-block mr-2 h-4 w-4" />
                  Profile
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
                >
                  <LogOut className="inline-block mr-2 h-4 w-4" />
                  Logout
                </button>
              </>
            )}
            {!isAuthenticated && (
              <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700" onClick={() => setIsMenuOpen(false)}>
                <User className="inline-block mr-2 h-4 w-4" />
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;