import React from 'react';
import { ShoppingBag, Pencil, Trash2 } from 'lucide-react'; 
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function ProductCard({ 
  product, 
  currentUser, 
  onEdit, 
  onDelete, 
  addToCart: addToCartProp // optional override for wholesale
}) { 

  // Try using normal cart context
  let cartAddToCart = null;
  try {
    const cartContext = useCart();
    cartAddToCart = cartContext.addToCart;
  } catch (err) {
    // if not inside CartProvider, ignore
    cartAddToCart = null;
  }

  // final chosen addToCart
  const addToCart = addToCartProp || cartAddToCart;

  const { user } = useAuth(); 
  const navigate = useNavigate();
  const activeUser = currentUser || user;

  const isSeller =
    activeUser &&
    (activeUser.role === "retailer" || activeUser.role === "wholesaler");

  const isClickable = !isSeller;

  const handleAddToCart = async (e) => {
    e.preventDefault();

    if (!addToCart) {
      console.error("❌ No addToCart available in ProductCard");
      return;
    }

    try {
      const res = await addToCart(product);
      if (res?.success === false) {
        console.error("❌ addToCart failed:", res.error);
        return;
      }

      navigate("/checkout");
    } catch (err) {
      console.error("❌ Error adding product:", err);
    }
  };

  const showRetailerBuyButton =
    activeUser?.role === "retailer" &&
    product?.sellerRole === "wholesaler";

  const showRetailerEditDelete =
    activeUser?.role === "retailer" &&
    product?.sellerRole === "retailer";

  const showWholesalerEditDelete =
    activeUser?.role === "wholesaler" &&
    product?.sellerRole === "wholesaler";

  const sellerRole = product?.sellerRole || product?.addedBy?.role || null;

  const roleLabel =
    sellerRole === "wholesaler"
      ? "Wholesaler"
      : sellerRole === "retailer"
      ? "Retailer"
      : null;

  const badgeClass =
    sellerRole === "wholesaler"
      ? "bg-purple-600 text-white"
      : sellerRole === "retailer"
      ? "bg-gray-800 text-white"
      : "bg-gray-400 text-white";

  return (
    <div className="relative bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 max-w-sm mx-auto transition-all duration-300 hover:shadow-2xl"> 

      {roleLabel && (
        <span
          className={`absolute top-3 right-3 px-3 py-1 text-xs font-semibold rounded-full ${badgeClass}`}
        >
          {roleLabel}
        </span>
      )}

      {/* Card Image */}
      <div className="relative">
        <div className="w-full aspect-square bg-white flex items-center justify-center relative">

          {isClickable ? (
            <Link to={`/product/${product._id}`} className="block w-full h-full">
              <img
                src={product.images?.[0] || "https://via.placeholder.com/300?text=No+Image"}
                alt={product.name}
                className="w-full h-full object-cover p-6"
              />
            </Link>
          ) : (
            <img
              src={product.images?.[0] || "https://via.placeholder.com/300?text=No+Image"}
              alt={product.name}
              className="w-full h-full object-cover p-6"
            />
          )}

          {(product?.stock ?? 0) === 0 && isClickable && (
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Out of Stock</span>
            </div>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="p-4 space-y-2">
        <span className="text-2xl font-semibold">₹{(product?.price ?? 0).toFixed(2)}</span>

        <h3 className="text-base text-gray-600 line-clamp-1">
          {isClickable ? (
            <Link to={`/product/${product._id}`} className="hover:text-gray-800">
              {product.name}
            </Link>
          ) : (
            product.name
          )}
        </h3>

        {/* Buttons */}
        <div className="mt-3">
          {showRetailerBuyButton && (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={(product?.stock ?? 0) === 0}
              className="w-full flex items-center justify-center gap-1 text-sm px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-60"
            >
              <ShoppingBag size={16} /> Buy
            </button>
          )}

          {(showRetailerEditDelete || showWholesalerEditDelete) && (
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onEdit(product)}
                className="w-1/2 flex justify-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                <Pencil size={16} /> Edit
              </button>

              <button
                onClick={() => onDelete(product._id)}
                className="w-1/2 flex justify-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
