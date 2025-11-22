// src/components/common/ProductCard.jsx
import React from 'react';
import { ShoppingBag } from 'lucide-react'; 
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function ProductCard({ product }) { 
  const { addToCart } = useCart();
  const { user } = useAuth(); 

  // --- Cart Status (Conceptual for the '1' badge) ---
  const isInCart = product._id === 'some-product-id-in-cart'; 

  // OWNER & SELLER LOGIC 
  const isOwner = user && (user._id === product.seller || user._id === product.seller?._id || user.id === product.seller || user.id === product.seller?._id);
  const isSeller = user && (user.role === "retailer" || user.role === "wholesaler");
  const isClickable = !isSeller && !isOwner; 

  const handleAddToCart = () => {
    if (product.stock > 0) {
      addToCart(product);
    }
  };

  // Logic Check for Cart Button Visibility:
  const showCustomerCartButton = isClickable && product.sellerRole === "retailer" && product.stock > 0;


  return (
    // Shadow increased from 'shadow-lg' to 'shadow-2xl' and hover is 'shadow-3xl' (custom high value)
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 max-w-sm mx-auto transition-all duration-300 hover:shadow-3xl"> 
      <div className="relative">
        
        {/* Product Image Container */}
        <div className="w-full aspect-square bg-white flex items-center justify-center relative">
          
          {/* Main Image - wrapped in Link if clickable, otherwise just an img */}
          {isClickable ? (
            <Link to={`/product/${product._id}`} className="block w-full h-full">
              <img
                src={product.images?.[0] || "https://via.placeholder.com/300?text=No+Image"}
                alt={product.name}
                className="w-full h-full object-cover p-6 cursor-pointer" 
              />
            </Link>
          ) : (
            <img
              src={product.images?.[0] || "https://via.placeholder.com/300?text=No+Image"}
              alt={product.name}
              className="w-full h-full object-cover p-6"
            />
          )}

          {/* Floating Cart Button (PURPLE) */}
          {showCustomerCartButton && (
            <button
              onClick={handleAddToCart}
              className="absolute bottom-4 right-4 p-3 rounded-full shadow-xl transition-all duration-200 bg-purple-600 text-white hover:bg-purple-700 active:scale-[0.95]"
              aria-label="Add to cart"
            >
              <ShoppingBag className="w-6 h-6" />
            </button>
          )}

          {/* Cart Badge/Count ('1' in blue circle) */}
          {isInCart && isClickable && (
            <span className="absolute bottom-16 right-4 w-6 h-6 flex items-center justify-center text-xs font-bold text-white bg-blue-500 rounded-full border-2 border-white">
              1
            </span>
          )}

          {/* Out of Stock Overlay */}
          {product.stock === 0 && isClickable && product.sellerRole === "retailer" && (
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <span className="text-white text-lg font-bold">Out of Stock</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Product Details (Price on top, Name below) */}
      <div className="p-4 space-y-1">
        
        {/* PRICE */}
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-semibold text-gray-800">
            ₹{product.price.toFixed(2)} 
          </span>
        </div>
        
        {/* NAME / LINK */}
        <h3 className="text-base text-gray-600 line-clamp-1">
          {isClickable ? (
            <Link
              to={`/product/${product._id}`}
              className="hover:text-gray-800 transition-colors"
            >
              {product.name}
            </Link>
          ) : (
            product.name
          )}
        </h3>
      </div>
    </div>
  );
}