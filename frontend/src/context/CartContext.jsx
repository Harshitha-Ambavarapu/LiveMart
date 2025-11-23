import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart([]);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCart(response.data.items || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------
  // FIXED addToCart FUNCTION
  // Supports:
  //    addToCart(product)
  //    addToCart(product._id)
  // --------------------------
  const addToCart = async (productOrId, quantity = 1) => {
    try {
      const productId =
        typeof productOrId === 'string'
          ? productOrId
          : productOrId?._id;

      if (!productId) {
        console.error("❌ addToCart: Invalid product or missing _id", productOrId);
        return { success: false };
      }

      const response = await axios.post(
        `${API_URL}/cart/add`,
        { productId, quantity },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );

      setCart(response.data.items);
      return { success: true };
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, error: error.response?.data?.message };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const response = await axios.put(
        `${API_URL}/cart/update`,
        { productId, quantity },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      setCart(response.data.items);
      return { success: true };
    } catch (error) {
      console.error('Error updating cart:', error);
      return { success: false };
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await axios.delete(`${API_URL}/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCart(response.data.items);
      return { success: true };
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { success: false };
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete(`${API_URL}/cart/clear`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCart([]);
      return { success: true };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { success: false };
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      getCartTotal,
      getCartCount,
      fetchCart
    }}>
      {children}
    </CartContext.Provider>
  );
};
