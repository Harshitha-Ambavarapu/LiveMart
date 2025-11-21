// src/components/common/ProductCard.jsx
import React from 'react';
import { ShoppingCart, Star, MapPin, Edit, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWholesaleCart } from '../../context/WholesaleCartContext';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function ProductCard({ product, onEdit, onDelete }) {
  const { addToCart } = useCart();
  const { addItem: addWholesaleItem } = useWholesaleCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    if (product.stock > 0) {
      addToCart(product);
      alert(`${product.name} added to cart!`);
    }
  };

  // OWNER LOGIC
  const isOwner =
    user &&
    (user._id === product.seller ||
      user._id === product.seller?._id ||
      user.id === product.seller ||
      user.id === product.seller?._id);

  const isSeller = user && (user.role === "retailer" || user.role === "wholesaler");

  const isClickable = !isSeller && !isOwner;

  // RETAILER → WHOLESALER QUICK BUY
  const handleRetailerBuyFromWholesaler = () => {
  const qtyStr = prompt(`Enter quantity (in ${product.unit})`, "10");
  if (!qtyStr) return;

  const qty = Number(qtyStr);
  if (qty <= 0) return alert("Invalid quantity");

  const markupStr = prompt("Enter markup per unit (₹)", "0");
  const markup = Number(markupStr || 0);

  addWholesaleItem(product, qty, markup);
  alert("Added to wholesale cart!");
};


  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden">

        {isClickable ? (
          <Link to={`/product/${product._id}`} className="block w-full h-full">
            <img
              src={product.images?.[0] || "https://via.placeholder.com/300?text=No+Image"}
              alt={product.name}
              className="w-full h-full object-cover cursor-pointer"
            />
          </Link>
        ) : (
          <img
            src={product.images?.[0] || "https://via.placeholder.com/300?text=No+Image"}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        )}

        {/* LOCAL BADGE */}
        {product.isLocal && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Local
          </div>
        )}

        {/* STOCK WARNINGS */}
        {product.stock > 0 && product.stock < 20 && (
          <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
            Only {product.stock} left
          </div>
        )}

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <span className="text-white text-lg font-bold">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-2">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-bold text-gray-800 line-clamp-1">
              {isClickable ? (
                <Link
                  to={`/product/${product._id}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {product.name}
                </Link>
              ) : (
                product.name
              )}
            </h3>

            {/* RATING */}
            {product.averageRating > 0 && (
              <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-semibold text-gray-700">
                  {product.averageRating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          <p className="text-sm text-gray-500 capitalize">{product.category}</p>
        </div>

        {/* DESCRIPTION */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2 h-10">
          {product.description}
        </p>

        {/* PRICE + STOCK + ROLE BADGE */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-blue-600">₹{product.price}</span>
              <span className="text-sm text-gray-500">/ {product.unit}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Stock: <span className="font-semibold">{product.stock}</span>
            </p>
          </div>

          {product.sellerRole && (
            <span
              className={`text-xs px-2 py-1 rounded font-medium ${
                product.sellerRole === "retailer"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-purple-100 text-purple-700"
              }`}
            >
              {product.sellerRole === "retailer" ? "Retailer" : "Wholesaler"}
            </span>
          )}
        </div>

        {/* ROLE-BASED BUTTONS */}
        {isOwner ? (
          // OWNER
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(product)}
              className="flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all"
            >
              <Edit className="w-5 h-5" /> Edit
            </button>

            <button
              onClick={() => onDelete(product._id)}
              className="flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-700 active:scale-95 transition-all"
            >
              <Trash2 className="w-5 h-5" /> Delete
            </button>
          </div>
        ) : user?.role === "retailer" && product.sellerRole === "wholesaler" ? (
          // RETAILER BUY FROM WHOLESALER
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/retailer/wholesale-market")}
              className="flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700"
            >
              View in Wholesale Market
            </button>

            <button
              onClick={handleRetailerBuyFromWholesaler}
              className="flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700"
            >
              <ShoppingCart className="w-4 h-4" /> Quick Buy
            </button>
          </div>
        ) : user?.role === "retailer" && product.sellerRole === "retailer" ? (
          // RETAILER VIEWING OTHER RETAILERS
          <button
            disabled
            className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 bg-gray-300 text-gray-600 cursor-not-allowed"
          >
            Seller View Only
          </button>
        ) : user?.role === "wholesaler" ? (
          // WHOLESALER does NOT buy from anyone
          <button
            disabled
            className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 bg-gray-300 text-gray-600 cursor-not-allowed"
          >
            Seller View Only
          </button>
        ) : (
          // CUSTOMER → ONLY BUY FROM RETAILERS
          product.sellerRole === "retailer" ? (
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                product.stock === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
              }`}
            >
              <ShoppingCart className="w-5 h-5" /> Add to Cart
            </button>
          ) : (
            <button
              disabled
              className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 bg-gray-300 text-gray-600 cursor-not-allowed"
            >
              Wholesale Only
            </button>
          )
        )}
      </div>
    </div>
  );
}
