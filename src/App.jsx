import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Sun, Moon, ShoppingBag, User, Search, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

function App() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true" || 
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  
  // Update cart count from localStorage on mount
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartCount(cart.length);
  }, []);
  
  // Listen for cart updates
  useEffect(() => {
    const handleStorageChange = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartCount(cart.length);
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);
  
  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);
  
  const toggleDarkMode = () => setDarkMode(!darkMode);
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-surface-900/80 backdrop-blur-md border-b border-surface-200 dark:border-surface-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2">
              <motion.div 
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center"
              >
                <ShoppingBag size={18} className="text-white" />
              </motion.div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                ShopSphere
              </span>
            </a>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="/" className="font-medium hover:text-primary transition-colors">Home</a>
              <a href="/products" className="font-medium hover:text-primary transition-colors">Products</a>
              <a href="/categories" className="font-medium hover:text-primary transition-colors">Categories</a>
              <a href="/deals" className="font-medium hover:text-primary transition-colors">Deals</a>
            </nav>
            
            {/* Actions */}
            <div className="flex items-center gap-3">
              <button 
                className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                onClick={toggleDarkMode}
                aria-label="Toggle dark mode"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={darkMode ? "dark" : "light"}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                  </motion.div>
                </AnimatePresence>
              </button>
              
              <button className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                <Search size={20} />
              </button>
              
              <a href="/cart" className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors relative">
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </a>
              
              <a href="/account" className="hidden md:block p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                <User size={20} />
              </a>
              
              {/* Mobile menu button */}
              <button 
                className="md:hidden p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden overflow-hidden bg-white dark:bg-surface-900 border-t border-surface-200 dark:border-surface-700"
            >
              <nav className="container mx-auto px-4 py-3 flex flex-col gap-3">
                <a href="/" className="py-2 font-medium hover:text-primary transition-colors">Home</a>
                <a href="/products" className="py-2 font-medium hover:text-primary transition-colors">Products</a>
                <a href="/categories" className="py-2 font-medium hover:text-primary transition-colors">Categories</a>
                <a href="/deals" className="py-2 font-medium hover:text-primary transition-colors">Deals</a>
                <a href="/account" className="py-2 font-medium hover:text-primary transition-colors">Account</a>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      
      {/* Footer */}
      <footer className="bg-surface-100 dark:bg-surface-800 border-t border-surface-200 dark:border-surface-700">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">ShopSphere</h3>
              <p className="text-surface-600 dark:text-surface-400 mb-4">
                Your one-stop destination for all your shopping needs with the best deals and products.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-surface-600 hover:text-primary dark:text-surface-400 dark:hover:text-primary-light transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-surface-600 hover:text-primary dark:text-surface-400 dark:hover:text-primary-light transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-surface-600 hover:text-primary dark:text-surface-400 dark:hover:text-primary-light transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Shop</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-surface-600 hover:text-primary dark:text-surface-400 dark:hover:text-primary-light transition-colors">All Products</a></li>
                <li><a href="#" className="text-surface-600 hover:text-primary dark:text-surface-400 dark:hover:text-primary-light transition-colors">New Arrivals</a></li>
                <li><a href="#" className="text-surface-600 hover:text-primary dark:text-surface-400 dark:hover:text-primary-light transition-colors">Featured</a></li>
                <li><a href="#" className="text-surface-600 hover:text-primary dark:text-surface-400 dark:hover:text-primary-light transition-colors">Discounts</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-surface-600 hover:text-primary dark:text-surface-400 dark:hover:text-primary-light transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-surface-600 hover:text-primary dark:text-surface-400 dark:hover:text-primary-light transition-colors">FAQs</a></li>
                <li><a href="#" className="text-surface-600 hover:text-primary dark:text-surface-400 dark:hover:text-primary-light transition-colors">Shipping</a></li>
                <li><a href="#" className="text-surface-600 hover:text-primary dark:text-surface-400 dark:hover:text-primary-light transition-colors">Returns</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Newsletter</h3>
              <p className="text-surface-600 dark:text-surface-400 mb-4">
                Subscribe to get special offers, free giveaways, and product launches.
              </p>
              <form className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="input flex-grow"
                  required
                />
                <button type="submit" className="btn-primary">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-surface-200 dark:border-surface-700 text-center text-surface-600 dark:text-surface-400">
            <p>© {new Date().getFullYear()} ShopSphere. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;