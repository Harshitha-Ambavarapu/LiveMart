import React from 'react';
import { ShoppingBag, Pencil, Trash2 } from 'lucide-react'; 
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function ProductCard({ product, currentUser, onEdit, onDelete }) { 
  const { addToCart } = useCart();
  const { user } = useAuth(); 

  // Use either parent-provided user or context user
  const activeUser = currentUser || user;

  const isSeller = activeUser && 
    (activeUser.role === "retailer" || activeUser.role === "wholesaler");

  const isClickable = !isSeller;

  const handleAddToCart = () => {
    if (product.stock > 0) {
      addToCart(product);
    }
  };

  const showCustomerCartButton =
    isClickable && product.sellerRole === "retailer" && product.stock > 0;

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 max-w-sm mx-auto transition-all duration-300 hover:shadow-2xl"> 
      <div className="relative">
        <div className="w-full aspect-square bg-white flex items-center justify-center relative">

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

          {showCustomerCartButton && (
            <button
              onClick={handleAddToCart}
              className="absolute bottom-4 right-4 p-3 rounded-full bg-purple-600 text-white shadow-xl hover:bg-purple-700 active:scale-95"
            >
              <ShoppingBag className="w-6 h-6" />
            </button>
          )}

          {product.stock === 0 && isClickable && (
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <span className="text-white text-lg font-bold">Out of Stock</span>
            </div>
          )}
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 space-y-2">
        <span className="text-2xl font-semibold text-gray-800">
          ₹{product.price.toFixed(2)}
        </span>

        <h3 className="text-base text-gray-600 line-clamp-1">
          {isClickable ? (
            <Link to={`/product/${product._id}`} className="hover:text-gray-800 transition-colors">
              {product.name}
            </Link>
          ) : (
            product.name
          )}
        </h3>

        {/* 👇 SHOW EDIT + DELETE ONLY FOR WHOLESALER/RETAILER */}
        {isSeller && (
  <div className="flex gap-2 mt-3">
    
    {/* EDIT BUTTON – 50% WIDTH */}
    <button
      onClick={() => onEdit(product)}
      className="
        w-1/2 flex items-center justify-center gap-1 
        text-sm px-3 py-1 
        bg-blue-100 text-blue-700 rounded 
        hover:bg-blue-200
      "
    >
      <Pencil size={16} /> Edit
    </button>

    {/* DELETE BUTTON – 50% WIDTH */}
    <button
      onClick={() => onDelete(product._id)}
      className="
        w-1/2 flex items-center justify-center gap-1 
        text-sm px-3 py-1 
        bg-red-100 text-red-700 rounded 
        hover:bg-red-200
      "
    >
      <Trash2 size={16} /> Delete
    </button>

  </div>
)}

      </div>
    </div>
  );
}
