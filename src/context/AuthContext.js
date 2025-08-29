import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import config from '../config/config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const savedUser = JSON.parse(localStorage.getItem('user'));
      if (savedUser && savedUser.role === 'admin') {
        setUser(savedUser);
      } else {
        // If user is not an admin, clear the auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Validate config
      if (!config.apiUrl) {
        throw new Error('API configuration is missing. Please check your configuration.');
      }

      console.log('[AuthContext] Attempting login to:', `${config.apiUrl}/auth/login`);
      
      const response = await axios.post(`${config.apiUrl}/auth/login`, {
        email,
        password,
      });

      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }
      
      if (user.role !== 'admin') {
        throw new Error('Access denied. Admin privileges required.');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Debug logging
      console.log('[AuthContext] Token stored:', token ? 'Present' : 'Missing');
      console.log('[AuthContext] User stored:', user);
      console.log('[AuthContext] Axios headers set:', axios.defaults.headers.common);
      
      setUser(user);
      navigate('/dashboard');
      toast.success('Login successful!');
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
      
      if (error.message === 'Access denied. Admin privileges required.') {
        throw error;
      }
      
      if (error.code === 'ERR_NETWORK') {
        toast.error('Network error. Please check your connection and try again.');
      } else if (error.response?.status === 404) {
        toast.error('Login endpoint not found. Please check your API configuration.');
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error(error.response?.data?.message || 'Login failed. Please try again.');
      }
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 