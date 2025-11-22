import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Package, Menu, X, Search, Heart, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWholesaleCart } from '../../context/WholesaleCartContext';

const Navbar = ({ searchTerm, setSearchTerm }) => {
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { wholesaleItems = [] } = useWholesaleCart();

  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm || '');
  
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    if (setSearchTerm) {
      setSearchTerm(value);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (setSearchTerm) {
      setSearchTerm(localSearchTerm);
    }
    if (window.location.pathname !== '/') {
      navigate('/');
    }
  };

  const navLinks = [
    { name: "Orders", href: "/orders", protected: true, icon: Package },
    { name: "Dashboard", href: "/dashboard", protected: true, icon: Heart },
  ];

  const RetailerMarketLink = {
      name: "Wholesale Market", 
      href: "/retailer/wholesale-market", 
      icon: ShoppingCart 
  };


  return (
    // REVERTED: Navbar background and shadow back to light grey/default
    <nav className="sticky top-0 z-50 
 
  **bg-gray-900/90** backdrop-blur supports-[backdrop-filter]:**bg-gray-900/90** shadow-lg shadow-gray-900/2"
>
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">

          {/* 1. LOGO */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0 group">
            {/* MODIFIED: Logo icon with purple gradient */}
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Zap className="h-5 w-5 text-white" />
            </div>
            
            {/* MODIFIED: LiveMart text style (Live=Dark, Mart=Purple) */}
            <span className="text-xl font-bold text-gray-800">Live</span>
            <span className="text-xl font-bold text-purple-600">Mart</span>
          </Link>

          {/* 2. CENTRAL SEARCH BAR (Desktop Only) */}
          <form onSubmit={handleSearchSubmit} className="flex-grow max-w-xl mx-8 hidden lg:block">
            <div className="relative">
              {/* REVERTED: Search icon color */}
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for products, brands, or categories..."
                value={localSearchTerm}
                onChange={handleSearchChange}
                // REVERTED: Input style back to white background, grey border/text
                className="w-full pl-10 pr-4 py-2 border border-gray-300 bg-white text-gray-800 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm transition-shadow" // Focus ring remains purple
              />
            </div>
          </form>

          {/* 3. ACTIONS (Right Side) */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            
            {/* USER BADGE & Dashboard/Market Link (Desktop) */}
            {user && (
              <div className="hidden lg:flex items-center space-x-4">
                {/* REVERTED: Text color back to grey, but hover/active state can use purple */}
                {user.role !== "customer" && (
                    <Link
                        to={user.role === "retailer" ? "/retailer/wholesale-market" : "/dashboard"}
                        className="p-2 text-sm font-medium text-gray-700 hover:text-purple-600 rounded-lg transition-colors flex items-center gap-1"
                        title={user.role === "retailer" ? "Wholesale Market" : "Seller Dashboard"}
                    >
                        {user.role === "retailer" ? <ShoppingCart className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
                        <span className="text-sm">{user.role === "retailer" ? "Market" : "Dashboard"}</span>
                    </Link>
                )}

                {/* REVERTED: User Name badge background and text back to grey theme */}
              
                
              </div>
            )}

            {/* ORDERS Button (Icon) */}
            {user && (
                <button
                    onClick={() => navigate("/orders")}
                    title="Your Orders"
                    className="hidden sm:block p-2 text-gray-700 hover:text-purple-600 transition-colors" // MODIFIED: Hover color to purple
                >
                    <Package className="w-6 h-6" />
                </button>
            )}

            {/* CART Button (Icon) - Customer/Retailer */}
            {user?.role !== "wholesaler" && (
              <button
                onClick={() => navigate("/cart")}
                title="Shopping Cart"
                className="relative p-2 text-gray-700 hover:text-purple-600 transition-colors" // MODIFIED: Hover color to purple
              >
                <ShoppingCart className="h-6 w-6" />
                {getCartCount() > 0 && (
                  // MODIFIED: Badge color changed from green/purple-500 to purple-600
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white">
                    {getCartCount()}
                  </span>
                )}
              </button>
            )}

            {/* LOGIN / LOGOUT Button (Text/Icon) */}
            {user ? (
              <button
                onClick={logout}
                title="Logout"
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            ) : (
              // MODIFIED: Login button background changed from green-600 to purple-600
              <Link to="/login" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                Login
              </Link>
            )}

            {/* MOBILE MENU TOGGLE */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-200 rounded-lg transition-colors" // REVERTED: Hover background to grey
            >
              {mobileMenuOpen ? <X className="h-6 w-6 text-gray-700" /> : <Menu className="h-6 w-6 text-gray-700" />} {/* REVERTED: Icon color to dark grey */}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white animate-slide-up">
          <div className="container mx-auto px-4 py-4 space-y-3">
             {/* Search Bar Mobile */}
            <form onSubmit={handleSearchSubmit} className="flex w-full mb-4">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={localSearchTerm}
                        onChange={handleSearchChange}
                        // MODIFIED: Focus ring to purple-500
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm" 
                    />
                </div>
            </form>

            {/* USER INFO MOBILE */}
            {user && (
              <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                {/* MODIFIED: User icon background and color changed to purple theme */}
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-600 capitalize">{user.role}</p>
                </div>
              </div>
            )}
            
            {/* NAV LINKS MOBILE */}
            {user && navLinks.map((link) => {
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  {/* MODIFIED: Icon color changed to purple-600 */}
                  <link.icon className="h-5 w-5 text-purple-600" />
                  {link.name}
                </Link>
              );
            })}

            {/* Wholesale Market (Retailer ONLY) */}
            {user?.role === "retailer" && (
              <Link
                to={RetailerMarketLink.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                {/* MODIFIED: Icon color changed to purple-600 */}
                <RetailerMarketLink.icon className="h-5 w-5 text-purple-600" />
                {RetailerMarketLink.name}
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
                {/* MODIFIED: Login button border and text changed to purple-600 */}
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full px-4 py-2 text-center border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 font-medium transition-colors"
                >
                  Login
                </Link>
                {/* MODIFIED: Sign Up button background changed to purple-600 */}
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full px-4 py-2 text-center bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
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