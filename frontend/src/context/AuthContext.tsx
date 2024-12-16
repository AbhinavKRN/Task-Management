import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { User, AuthResponse } from '../types/index';
import { useNavigate } from 'react-router-dom';

axios.defaults.baseURL = 'http://localhost:5000';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      
      if (storedUser && storedToken) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          // Only navigate if we're on the login page
          if (window.location.pathname === '/login') {
            navigate('/');
          }
        } catch (err) {
          // If there's an error parsing stored data, clear it
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          navigate('/login');
        }
      } else {
        // If no stored credentials, redirect to login unless already there
        if (window.location.pathname !== '/login') {
          navigate('/login');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleAuthResponse = (response: AuthResponse) => {
    const { token, user } = response;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setToken(token);
    setUser(user);
    navigate('/');
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Attempting login with:', { email });
      const { data } = await axios.post<AuthResponse>('/api/auth/login', 
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Login successful:', data);
      handleAuthResponse(data);
    } catch (err: any) {
      console.error('Login error:', {
        response: err.response?.data,
        status: err.response?.status,
        error: err
      });
      const message = err?.response?.data?.message || 'Login failed';
      setError(message);
      return Promise.reject(message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post<AuthResponse>('/api/auth/register', 
        { name, email, password },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Registration successful:', data);
      handleAuthResponse(data);
    } catch (err: any) {
      console.error('Registration error:', {
        response: err.response?.data,
        status: err.response?.status,
        error: err
      });
      const message = err?.response?.data?.message || 'Registration failed';
      setError(message);
      return Promise.reject(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setError(null);
    navigate('/login');
  };

  // Show loading spinner while checking initial auth status
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        login, 
        register,
        logout, 
        loading,
        error 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};