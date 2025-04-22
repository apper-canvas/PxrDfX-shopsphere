import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Heart, Star, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import MainFeature from "../components/MainFeature";

// Sample product data
const PRODUCTS = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    price: 199.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "Electronics",
    rating: 4.8,
    reviews: 124,
    description: "Experience crystal-clear sound with these premium wireless headphones featuring noise cancellation technology.",
    featured: true,
    discount: 15
  },
  {
    id: 2,
    name: "Ergonomic Office Chair",
    price: 249.99,
    image: "https://images.unsplash.com/photo-1505843490701-5be5d1b31f8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "Furniture",
    rating: 4.6,
    reviews: 89,
    description: "Stay comfortable during long work hours with this ergonomic office chair designed for proper posture support.",
    featured: false,
    discount: 0
  },
  {
    id: 3,
    name: "Smart Fitness Watch",
    price: 129.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "Wearables",
    rating: 4.5,
    reviews: 156,
    description: "Track your fitness goals with this advanced smart watch featuring heart rate monitoring and GPS.",
    featured: true,
    discount: 10
  },
  {
    id: 4,
    name: "Artisan Coffee Maker",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "Kitchen",
    rating: 4.7,
    reviews: 72,
    description: "Brew the perfect cup of coffee with this premium artisan coffee maker featuring precision temperature control.",
    featured: false,
    discount: 0
  },
  {
    id: 5,
    name: "Designer Backpack",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "Fashion",
    rating: 4.4,
    reviews: 63,
    description: "Stylish and functional backpack with multiple compartments, perfect for daily commute or travel.",
    featured: true,
    discount: 5
  },
  {
    id: 6,
    name: "Portable Bluetooth Speaker",
    price: 59.99,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    category: "Electronics",
    rating: 4.3,
    reviews: 98,
    description: "Take your music anywhere with this waterproof portable Bluetooth speaker with 20-hour battery life.",
    featured: false,
    discount: 0
  }
];

// Categories
const CATEGORIES = [
  "All",
  "Electronics",
  "Furniture",
  "Wearables",
  "Kitchen",
  "Fashion"
];

function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filteredProducts, setFilteredProducts] = useState(PRODUCTS);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter products by category
  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredProducts(PRODUCTS);
    } else {
      setFilteredProducts(PRODUCTS.filter(product => product.category === selectedCategory));
    }
  }, [selectedCategory]);
  
  // Load cart and wishlist from localStorage on mount
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const savedWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setCart(savedCart);
    setWishlist(savedWishlist);
  }, []);
  
  // Add to cart function
  const addToCart = (product) => {
    const newCart = [...cart];
    const existingItem = newCart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      newCart.push({ ...product, quantity: 1 });
    }
    
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    
    // Trigger storage event for other components to update
    window.dispatchEvent(new Event("storage"));
  };
  
  // Toggle wishlist function
  const toggleWishlist = (productId) => {
    let newWishlist;
    
    if (wishlist.includes(productId)) {
      newWishlist = wishlist.filter(id => id !== productId);
    } else {
      newWishlist = [...wishlist, productId];
    }
    
    setWishlist(newWishlist);
    localStorage.setItem("wishlist", JSON.stringify(newWishlist));
  };
  
  // Calculate discounted price
  const getDiscountedPrice = (price, discount) => {
    if (!discount) return price;
    return (price - (price * discount / 100)).toFixed(2);
  };
  
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/5 dark:to-accent/5">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent"
              >
                Discover Amazing Products
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-lg text-surface-600 dark:text-surface-300 mb-6"
              >
                Shop the latest trends with our curated collection of high-quality products. 
                From electronics to fashion, we've got everything you need.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-wrap gap-4"
              >
                <a href="#products" className="btn-primary">
                  Shop Now
                </a>
                <a href="#featured" className="btn-outline">
                  Explore Featured
                </a>
              </motion.div>
            </div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-2xl shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1607082349566-187342175e2f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80" 
                  alt="ShopSphere Collection" 
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-900/70 to-transparent flex items-end">
                  <div className="p-6">
                    <span className="inline-block px-3 py-1 bg-secondary text-white text-sm font-bold rounded-full mb-2">
                      New Collection
                    </span>
                    <h3 className="text-2xl font-bold text-white mb-2">Summer Essentials</h3>
                    <p className="text-surface-100">Discover our latest collection for the season</p>
                  </div>
                </div>
              </div>
              
              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-white dark:bg-surface-800 rounded-full shadow-soft p-3 animate-pulse">
                <span className="text-secondary font-bold">20% OFF</span>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto fill-white dark:fill-surface-900">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Shop by Category</h2>
            <button 
              className="md:hidden flex items-center gap-2 text-surface-600 dark:text-surface-300"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} />
              <span>Filters</span>
            </button>
          </div>
          
          <div className={`md:flex gap-4 overflow-x-auto pb-4 scrollbar-hide ${showFilters ? 'block' : 'hidden md:flex'}`}>
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-primary text-white shadow-soft'
                    : 'bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>
      
      {/* Products Section */}
      <section id="products" className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">
            {selectedCategory === "All" ? "All Products" : selectedCategory}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="card group"
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Wishlist button */}
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-surface-800/80 rounded-full shadow-md hover:bg-white dark:hover:bg-surface-700 transition-colors"
                    aria-label={`Add ${product.name} to wishlist`}
                  >
                    <Heart 
                      size={18} 
                      className={wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : ''} 
                    />
                  </button>
                  
                  {/* Discount badge */}
                  {product.discount > 0 && (
                    <div className="absolute top-3 left-3 bg-secondary text-white text-sm font-bold px-2 py-1 rounded">
                      {product.discount}% OFF
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex items-center gap-1 mb-2">
                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">{product.rating}</span>
                    <span className="text-sm text-surface-500 dark:text-surface-400">({product.reviews})</span>
                  </div>
                  
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  
                  <p className="text-sm text-surface-600 dark:text-surface-400 mb-3">
                    {product.category}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      {product.discount > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">${getDiscountedPrice(product.price, product.discount)}</span>
                          <span className="text-surface-500 dark:text-surface-400 line-through text-sm">${product.price}</span>
                        </div>
                      ) : (
                        <span className="font-bold text-lg">${product.price}</span>
                      )}
                    </div>
                    
                    <button
                      onClick={() => addToCart(product)}
                      className="p-2 bg-primary/10 dark:bg-primary/20 text-primary rounded-full hover:bg-primary hover:text-white transition-colors"
                      aria-label={`Add ${product.name} to cart`}
                    >
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Main Feature Section */}
      <section className="py-16 bg-surface-50 dark:bg-surface-800/50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Your Shopping Cart</h2>
          <MainFeature />
        </div>
      </section>
      
      {/* Featured Collections */}
      <section id="featured" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Featured Collections</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card overflow-hidden group">
              <div className="relative h-80">
                <img 
                  src="https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                  alt="Electronics Collection" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-900/70 to-transparent flex items-end">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">Electronics</h3>
                    <p className="text-surface-100 mb-4">Latest gadgets and tech accessories</p>
                    <a href="#" className="inline-block px-4 py-2 bg-white text-surface-900 rounded-lg font-medium hover:bg-primary hover:text-white transition-colors">
                      Explore
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card overflow-hidden group">
              <div className="relative h-80">
                <img 
                  src="https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                  alt="Fashion Collection" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-900/70 to-transparent flex items-end">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">Fashion</h3>
                    <p className="text-surface-100 mb-4">Trending styles for every season</p>
                    <a href="#" className="inline-block px-4 py-2 bg-white text-surface-900 rounded-lg font-medium hover:bg-primary hover:text-white transition-colors">
                      Explore
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card overflow-hidden group">
              <div className="relative h-80">
                <img 
                  src="https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                  alt="Home Collection" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-900/70 to-transparent flex items-end">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">Home & Living</h3>
                    <p className="text-surface-100 mb-4">Elevate your living space</p>
                    <a href="#" className="inline-block px-4 py-2 bg-white text-surface-900 rounded-lg font-medium hover:bg-primary hover:text-white transition-colors">
                      Explore
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/5 dark:to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Join Our Newsletter</h2>
            <p className="text-surface-600 dark:text-surface-300 mb-6">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            <form className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="input flex-grow"
                required
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;