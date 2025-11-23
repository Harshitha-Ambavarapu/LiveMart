import React from 'react';
import { ShoppingBag, Pencil, Trash2 } from 'lucide-react'; 
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { useWholesaleCart } from "../../context/WholesaleCartContext";

export default function ProductCard({ product, currentUser, onEdit, onDelete }) { 

  const { user } = useAuth(); 
  const { addWholesaleItem } = useWholesaleCart();

  const activeUser = currentUser || user;

  const isSeller =
    activeUser &&
    (activeUser.role === "retailer" || activeUser.role === "wholesaler");

  const isClickable = !isSeller;

  const handleAddToCart = () => {
    if (product.stock > 0) {
      addWholesaleItem(
        {
          _id: product._id,
          name: product.name,
          price: product.wholesalePrice || product.price,
          images: product.images,
        },
        1
      );
    }
  };

  const showRetailerBuyButton =
    activeUser?.role === "retailer" &&
    product?.sellerRole === "wholesaler";

  const showRetailerEditDelete =
    activeUser?.role === "retailer" &&
    product?.sellerRole === "retailer";

  const showWholesalerEditDelete =
    activeUser?.role === "wholesaler";

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
        </div>
      </div>

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

        <div className="mt-3">
          {showRetailerBuyButton && (
            <button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-1 text-sm px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              <ShoppingBag size={16} /> Buy
            </button>
          )}

          {(showRetailerEditDelete || showWholesalerEditDelete) && (
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(product)}
                className="w-1/2 flex items-center justify-center gap-1 text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                <Pencil size={16} /> Edit
              </button>

              <button
                onClick={() => onDelete(product._id)}
                className="w-1/2 flex items-center justify-center gap-1 text-sm px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
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
