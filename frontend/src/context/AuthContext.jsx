// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

  // Use useCallback to memoize loadUser function
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // ✅ FIXED: Changed backticks to parentheses
        const res = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data.user);
      } catch (error) {
        console.error('Load user error:', error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, [API_URL]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    try {
      // ✅ FIXED: Changed backticks to parentheses
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      // ✅ FIXED: Changed backticks to parentheses
      const res = await axios.post(`${API_URL}/auth/register`, userData);
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const verifyOTP = async (userId, otp) => {
    try {
      // ✅ FIXED: Changed backticks to parentheses
      const res = await axios.post(`${API_URL}/auth/verify-otp`, { userId, otp });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    verifyOTP,
    logout,
    loadUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};