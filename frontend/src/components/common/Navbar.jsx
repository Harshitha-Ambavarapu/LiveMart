import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Package, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWholesaleCart } from '../../context/WholesaleCartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();

  // WHOLESALE CART (SAFE ACCESS)
  const { wholesaleItems = [] } = useWholesaleCart();

  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Shop", href: "/" },
    { name: "Orders", href: "/orders", protected: true },
    { name: "Dashboard", href: "/dashboard", protected: true },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">

          {/* LOGO */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
              LiveMart
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              if (link.protected && !user) return null;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                >
                  {link.name}
                </Link>
              );
            })}

            {/* Wholesale Market (Retailer ONLY) */}
            {user?.role === "retailer" && (
              <Link
                to="/retailer/wholesale-market"
                className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
              >
                Wholesale Market
              </Link>
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex items-center space-x-3">

            {/* USER BADGE (desktop) */}
            {user && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-primary-50 rounded-full">
                <User className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-gray-700">
                  {user.name?.split(' ')[0]}
                </span>
                <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full font-semibold capitalize">
                  {user.role}
                </span>
              </div>
            )}

            {/* CUSTOMER CART */}
            {user?.role !== "wholesaler" && (
              <button
                onClick={() => navigate("/cart")}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ShoppingCart className="h-5 w-5 text-gray-700" />
                {getCartCount() > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white animate-scale-in">
                    {getCartCount()}
                  </span>
                )}
              </button>
            )}

            {/* WHOLESALE CART (Retailer ONLY) */}
            {user?.role === "retailer" && (
              <button
                onClick={() => navigate("/wholesale-cart")}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors hidden md:flex"
              >
                <Package className="h-5 w-5 text-gray-700" />
                {wholesaleItems.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white animate-scale-in">
                    {wholesaleItems.length}
                  </span>
                )}
              </button>
            )}

            {/* MOBILE ORDERS SHORTCUT */}
            {user && (
              <Link to="/orders" className="md:hidden">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Package className="h-5 w-5 text-gray-700" />
                </button>
              </Link>
            )}

            {/* LOGIN / LOGOUT */}
            {user ? (
              <button
                onClick={logout}
                className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login">
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
                    Login
                  </button>
                </Link>
                <Link to="/register">
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}

            {/* MOBILE MENU TOGGLE */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6 text-gray-700" /> : <Menu className="h-6 w-6 text-gray-700" />}
            </button>

          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white animate-slide-up">
          <div className="container mx-auto px-4 py-4 space-y-3">

            {/* USER INFO MOBILE */}
            {user && (
              <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-600 capitalize">{user.role}</p>
                </div>
              </div>
            )}

            {/* NAV LINKS MOBILE */}
            {navLinks.map((link) => {
              if (link.protected && !user) return null;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  {link.name}
                </Link>
              );
            })}

            {/* Wholesale Market (Retailer ONLY) */}
            {user?.role === "retailer" && (
              <Link
                to="/retailer/wholesale-market"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Wholesale Market
              </Link>
            )}

            {/* Wholesale Cart (Retailer ONLY) */}
            {user?.role === "retailer" && (
              <Link
                to="/wholesale-cart"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                <Package className="h-5 w-5" />
                Wholesale Cart
                {wholesaleItems.length > 0 && (
                  <span className="ml-auto bg-purple-600 text-white rounded-full text-xs px-2 py-0.5">
                    {wholesaleItems.length}
                  </span>
                )}
              </Link>
            )}

            {/* Logout (mobile) */}
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            ) : (
              <div className="space-y-2 pt-2 border-t">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full px-4 py-2 text-center border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full px-4 py-2 text-center bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
