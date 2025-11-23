import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Package, Menu, X, Search, Heart, Zap, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWholesaleCart } from '../../context/WholesaleCartContext';
import { LayoutDashboard } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();
  const { wholesaleItems = [] } = useWholesaleCart();

  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search input state
  const [localSearchTerm, setLocalSearchTerm] = useState("");

  // ⭐ Unified Search Handler
  const handleNavbarSearch = (e) => {
    e.preventDefault();
    if (localSearchTerm.trim() !== "") {
      navigate(`/?search=${localSearchTerm}`);
    } else {
      navigate(`/`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur shadow-lg shadow-gray-900/20">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">

          {/* LOGO */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0 group">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Live</span>
            <span className="text-xl font-bold text-purple-400">Mart</span>
          </Link>

          {/* ACTION BUTTONS */}
          <div className="flex items-center space-x-4 flex-shrink-0">

            {/* ⭐ DASHBOARD BUTTON (retailer + wholesaler) */}
            {user && (user.role === "retailer" || user.role === "wholesaler") && (
              <button
                onClick={() => navigate("/dashboard")}
                className="hidden sm:block p-2 text-gray-300 hover:text-purple-400 transition"
              >
                <LayoutDashboard className="w-6 h-6" />
              </button>
            )}

            {/* ⭐ WHOLESALE MARKET BUTTON (retailer only) */}
            {user?.role === "retailer" && (
              <button
                onClick={() => navigate("/retailer/wholesale-market")}
                className="hidden sm:block p-2 text-gray-300 hover:text-purple-400 transition"
              >
                <Store className="w-6 h-6" />
              </button>
            )}

            {/* ⭐ ORDERS BUTTON — HIDE FOR WHOLESALER */}
            {user && user.role !== "wholesaler" && (
              <button
                onClick={() => navigate("/orders")}
                className="hidden sm:block p-2 text-gray-300 hover:text-purple-400 transition"
              >
                <Package className="w-6 h-6" />
              </button>
            )}

            {/* CART — already hidden for wholesalers */}
            {user?.role !== "wholesaler" && (
              <button
                onClick={() => navigate("/cart")}
                className="relative p-2 text-gray-300 hover:text-purple-400 transition"
              >
                <ShoppingCart className="h-6 w-6" />
                {getCartCount() > 0 && (
                  <span className="absolute -right-1 -top-1 bg-purple-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {getCartCount()}
                  </span>
                )}
              </button>
            )}

            {user ? (
              <button
                onClick={logout}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-300 hover:text-red-500 hover:bg-red-100 rounded-lg"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
              >
                Login
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-700 rounded-lg"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-white" />
              ) : (
                <Menu className="h-6 w-6 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white animate-slide-up">
          <div className="container mx-auto px-4 py-4 space-y-3">

            {/* MOBILE SEARCH */}
            <form onSubmit={handleNavbarSearch} className="flex w-full mb-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </form>

            {/* MOBILE USER INFO */}
            {user && (
              <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-purple-200 flex items-center justify-center">
                  <User className="h-5 w-5 text-purple-700" />
                </div>
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-xs text-gray-600 capitalize">{user.role}</p>
                </div>
              </div>
            )}

            {/* ⭐ MOBILE ORDERS — HIDE FOR WHOLESALER */}
            {user && user.role !== "wholesaler" && (
              <Link
                to="/orders"
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg"
              >
                <Package className="h-5 w-5 text-purple-600" /> Orders
              </Link>
            )}

            {/* Logout for mobile */}
            {user && (
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-100 rounded-lg"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
