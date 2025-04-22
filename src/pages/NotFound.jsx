import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";

function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-24 h-24 bg-surface-100 dark:bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl font-bold">404</span>
          </div>
          
          <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
          
          <p className="text-surface-600 dark:text-surface-400 mb-8">
            The page you are looking for doesn't exist or has been moved.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/" 
              className="btn-primary flex items-center justify-center gap-2"
            >
              <Home size={18} />
              Back to Home
            </Link>
            
            <button 
              onClick={() => window.history.back()} 
              className="btn-outline flex items-center justify-center gap-2"
            >
              <ArrowLeft size={18} />
              Go Back
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default NotFound;