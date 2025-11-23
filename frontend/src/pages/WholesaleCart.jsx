import React from "react";
import { useNavigate } from "react-router-dom";
import { useWholesaleCart } from "../context/WholesaleCartContext";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";

const WholesaleCart = () => {
  const navigate = useNavigate();
  const { wholesaleItems, removeItem, clearCart, addWholesaleItem } =
    useWholesaleCart();

  const handleQuantityChange = (item, newQty) => {
    if (newQty < 1) return;
    addWholesaleItem(item, newQty - item.quantity);
  };

  const subtotal = wholesaleItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shipping = subtotal > 500 ? 0 : 50;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  if (wholesaleItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <ShoppingBag className="w-24 h-24 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your wholesale cart is empty</h2>
        <button
          onClick={() => navigate("/retailer/wholesale-market")}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Go to Wholesale Market
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Wholesale Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              {wholesaleItems.map(item => (
                <div key={item._id} className="flex items-center gap-4 p-4 border-b">
                  
                  <img
                    src={item.images?.[0] || "https://via.placeholder.com/100"}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded"
                  />

                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-gray-600">₹{item.price}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(item, item.quantity - 1)}
                      className="p-1 rounded border hover:bg-gray-100"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item, item.quantity + 1)}
                      className="p-1 rounded border hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-lg">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeItem(item._id)}
                      className="text-red-600 hover:text-red-700 mt-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (18%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate("/wholesale-checkout")}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold"
              >
                Proceed to Checkout
              </button>

              <button
                onClick={() => navigate("/retailer/wholesale-market")}
                className="w-full mt-3 border border-gray-300 py-3 rounded-lg hover:bg-gray-50"
              >
                Continue Shopping
              </button>

              <button
                onClick={clearCart}
                className="w-full mt-3 bg-gray-200 py-3 rounded-lg hover:bg-gray-300"
              >
                Clear Cart
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default WholesaleCart;
