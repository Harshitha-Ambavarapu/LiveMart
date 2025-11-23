import React from 'react';
import { ShoppingBag, Pencil, Trash2 } from 'lucide-react'; 
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function ProductCard({ product, currentUser, onEdit, onDelete }) { 
  const { addToCart } = useCart();
  const { user } = useAuth(); 

  const activeUser = currentUser || user;

  // Seller = can see Edit/Delete on their own products
  const isSeller = activeUser && 
    (activeUser.role === "retailer" || activeUser.role === "wholesaler");

  // Customer can click product details
  const isClickable = !isSeller;

  const handleAddToCart = () => {
    if ((product?.stock ?? 0) > 0) {
      addToCart(product);  // This is your wholesaleCart logic
    }
  };
 
  // Retailer buying wholesaler product
  const showRetailerBuyButton =
    activeUser?.role === "retailer" &&
    product?.sellerRole === "wholesaler";

  // Retailer editing their own retailer products
  const showRetailerEditDelete =
    activeUser?.role === "retailer" &&
    product?.sellerRole === "retailer";

  // Wholesaler editing their products
  const showWholesalerEditDelete =
    activeUser?.role === "wholesaler" &&
    product?.sellerRole === "wholesaler";

  // === Badge logic ===
  // Try common fields: product.sellerRole, fallback to product.addedBy?.role
  const sellerRole = product?.sellerRole || product?.addedBy?.role || null;
  const roleLabel =
    sellerRole === "wholesaler" ? "Wholesaler" :
    sellerRole === "retailer" ? "Retailer" : null;

  const badgeClass =
    sellerRole === "wholesaler"
      ? "bg-purple-600 text-white"    // wholesaler: purple
      : sellerRole === "retailer"
      ? "bg-gray-800 text-white"      // retailer: dark/black
      : "bg-gray-400 text-white";     // unknown: grey

  return (
    // make the card relative so the badge can be absolutely positioned
    <div className="relative bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 max-w-sm mx-auto transition-all duration-300 hover:shadow-2xl"> 

      {/* ===== Badge (top-right) ===== */}
      {roleLabel && (
        <span
          className={`absolute top-3 right-3 z-10 px-3 py-1 text-xs font-semibold rounded-full ${badgeClass} shadow-sm`}
          title={roleLabel}
        >
          {roleLabel}
        </span>
      )}

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

          {/* Product Image Wrapper */}
          { (product?.stock ?? 0) === 0 && isClickable && (
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <span className="text-white text-lg font-bold">Out of Stock</span>
            </div>
          )}
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 space-y-2">
        <span className="text-2xl font-semibold text-gray-800">
          ₹{(product?.price ?? 0).toFixed(2)}
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

        {/* -------------------- BUTTON SECTION -------------------- */}
        <div className="mt-3">

          {/* BUY BUTTON — Retailer buying Wholesaler Product */}
          {showRetailerBuyButton && (
            <button
              onClick={handleAddToCart}
              className="
                w-full flex items-center justify-center gap-1
                text-sm px-3 py-2
                bg-green-100 text-green-700 rounded
                hover:bg-green-200
              "
            >
              <ShoppingBag size={16} /> Buy
            </button>
          )}

          {/* EDIT + DELETE — Retailer editing own products OR Wholesaler editing theirs */}
          {(showRetailerEditDelete || showWholesalerEditDelete) && (
            <div className="flex gap-2">
              
              {/* EDIT */}
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

              {/* DELETE */}
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
        {/* -------------------------------------------------------- */}

      </div>
    </div>
  );
}