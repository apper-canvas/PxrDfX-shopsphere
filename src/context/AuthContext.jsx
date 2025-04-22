import { createContext, useState, useEffect } from 'react';
import userService from '../services/UserService';

// Create the authentication context
export const AuthContext = createContext(null);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for user session on initial load
  useEffect(() => {
    const checkUserSession = () => {
      try {
        const currentUser = userService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkUserSession();
  }, []);

  // Setup auth UI
  const setupAuth = (elementId, navigate) => {
    try {
      userService.setupAuth(elementId, {
        onSuccess: (user) => {
          setUser(user.data);
          setError(null);
          navigate('/');
        },
        onError: (err) => {
          setError(err.message);
        }
      });
    } catch (err) {
      setError(err.message);
    }
  };

  // Show login UI
  const showLogin = (elementId) => {
    try {
      userService.showLogin(elementId);
    } catch (err) {
      setError(err.message);
    }
  };

  // Show signup UI
  const showSignup = (elementId) => {
    try {
      userService.showSignup(elementId);
    } catch (err) {
      setError(err.message);
    }
  };

  // Logout user
  const logout = () => {
    try {
      userService.logout();
      setUser(null);
      // Return success
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // Context value
  const value = {
    user,
    setUser,
    loading,
    error,
    isAuthenticated: !!user,
    setupAuth,
    showLogin,
    showSignup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};