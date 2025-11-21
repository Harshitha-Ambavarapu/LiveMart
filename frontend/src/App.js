// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import RetailerOrders from './pages/RetailerOrders';
import Navbar from './components/common/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderConfirmation from './pages/OrderConfirmation';
import AddProduct from './pages/AddProduct';
import Product from './pages/Product';
import Dashboard from './pages/Dashboard';
import ProductEdit from "./pages/ProductEdit";
import AuthSuccess from './pages/AuthSuccess';
import WholesaleMarket from './pages/WholesaleMarket';
import WholesaleCart from './pages/WholesaleCart';
import OrderDetails from "./pages/OrderDetails";


// ⭐ Protected Route (with optional role restriction)
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/home" replace />;

  return children;
};


// ⭐ Public Route (login/register only when logged out)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  return !user ? children : <Navigate to="/home" replace />;
};


// ⭐ Main App Content
const AppContent = () => {
  const { user } = useAuth();

  return (
    <>
      {user && <Navbar />}

      <Routes>

        {/* Landing */}
        <Route path="/" element={user ? <Navigate to="/home" /> : <LandingPage />} />

        {/* Auth Pages */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/auth/success" element={<AuthSuccess />} />

        {/* Product Edit (must be protected) */}
        <Route
          path="/edit-product/:id"
          element={<ProtectedRoute><ProductEdit /></ProtectedRoute>}
        />

        {/* Home */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />

        {/* Customer Routes */}
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/order-confirmation/:orderId" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />

        {/* Products */}
        <Route path="/add-product" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
        <Route path="/product/:id" element={<ProtectedRoute><Product /></ProtectedRoute>} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        {/* Retailer Only */}
        <Route
          path="/retailer/wholesale-market"
          element={
            <ProtectedRoute allowedRoles={['retailer']}>
              <WholesaleMarket />
            </ProtectedRoute>
          }
        />
        <Route
  path="/order/:id"
  element={
    <ProtectedRoute>
      <OrderDetails />
    </ProtectedRoute>
  }
/>

        <Route
          path="/wholesale-cart"
          element={
            <ProtectedRoute allowedRoles={['retailer']}>
              <WholesaleCart />
            </ProtectedRoute>
          }
        />
        <Route
  path="/retailer/orders"
  element={
    <ProtectedRoute>
      <RetailerOrders />
    </ProtectedRoute>
  }
/>

        {/* Catch All */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </>
  );
};


// ⭐ Main App Wrapper – NO PROVIDERS HERE ANYMORE
export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
