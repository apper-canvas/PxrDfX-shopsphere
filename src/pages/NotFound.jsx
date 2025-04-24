import { Link } from 'react-router-dom';
import { HomeIcon, Search } from 'lucide-react';

function NotFound() {
  return (
    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
      <h1 className="text-8xl font-bold text-blue-600">404</h1>
      <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-gray-100">Page Not Found</h2>
      <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
        <Link 
          to="/"
          className="btn-primary flex items-center justify-center"
        >
          <HomeIcon className="h-5 w-5 mr-2" />
          Go Home
        </Link>
        <Link 
          to="/products"
          className="btn-secondary flex items-center justify-center"
        >
          <Search className="h-5 w-5 mr-2" />
          Browse Products
        </Link>
      </div>
    </div>
  );
}

export default NotFound;