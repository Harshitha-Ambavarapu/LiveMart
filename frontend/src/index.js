// index.js
import React from 'react';
import './index.css';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WholesaleCartProvider } from './context/WholesaleCartContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <CartProvider>
      <WholesaleCartProvider>
        <App />
      </WholesaleCartProvider>
    </CartProvider>
  </AuthProvider>
);
