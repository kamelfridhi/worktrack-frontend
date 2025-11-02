import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        // First ensure CSRF token is available
        try {
          await api.get('/login/');
        } catch (e) {
          // Ignore, we just need the CSRF cookie
        }

        // Try to access a protected endpoint to verify auth
        const response = await api.get('/employees/');
        if (response.status === 200) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem('isAuthenticated');
        }
      } catch (error) {
        // If 403 or 401, user is not authenticated
        if (error.response?.status === 403 || error.response?.status === 401) {
          setIsAuthenticated(false);
          localStorage.removeItem('isAuthenticated');
        }
      } finally {
        setLoading(false);
      }
    };

    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
      checkAuth();
    } else {
      // Still fetch CSRF token for login form
      api.get('/login/').catch(() => {});
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      // First, get CSRF token by making a GET request
      const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000';
      try {
        await fetch(`${baseUrl}/admin/login/`, {
          method: 'GET',
          credentials: 'include',
        });
      } catch (e) {
        // Ignore errors, we just need the CSRF cookie
      }

      // Use the custom DRF login endpoint
      const response = await api.post('/login/', {
        username,
        password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        setIsAuthenticated(true);
        localStorage.setItem('isAuthenticated', 'true');

        // Ensure CSRF token is fetched after login
        try {
          await api.get('/login/');
        } catch (e) {
          // Ignore - we just need CSRF cookie to be set
        }

        return { success: true };
      } else {
        return { success: false, error: response.data.error || 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
      return { success: false, error: errorMessage };
    }
  };


  const logout = async () => {
    try {
      await api.post('/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      localStorage.removeItem('isAuthenticated');
      // Use window.location for navigation since we're outside Router context
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

