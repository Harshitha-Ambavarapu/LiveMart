// src/pages/WholesaleCart.jsx
import React from "react";
import { useWholesaleCart } from "../context/WholesaleCartContext";
import { Trash2 } from "lucide-react";

const WholesaleCart = () => {
  const { wholesaleItems, removeItem, clearCart } = useWholesaleCart();

  const calculateTotal = () => {
    return wholesaleItems.reduce((sum, item) => {
      const itemTotal = (item.price + (item.markup || 0)) * item.quantity;
      return sum + itemTotal;
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">Wholesale Cart</h1>

        {wholesaleItems.length === 0 ? (
          <p className="text-gray-600 text-lg">Your wholesale cart is empty.</p>
        ) : (
          <>
            <div className="bg-white shadow rounded-lg p-4 space-y-4">
              {wholesaleItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between border-b pb-3"
                >
                  <div>
                    <h2 className="font-semibold text-lg">{item.name}</h2>
                    <p className="text-sm text-gray-600">
                      Wholesale Price: ₹{item.price}
                    </p>
                    <p className="text-sm text-gray-600">
                      Markup: ₹{item.markup || 0}
                    </p>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity}
                    </p>
                    <p className="text-sm font-medium mt-1">
                      Total: ₹
                      {(item.price + (item.markup || 0)) * item.quantity}
                    </p>
                  </div>

                  <button
                    onClick={() => removeItem(item._id)}
                    className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-white shadow rounded-lg">
              <h2 className="text-xl font-semibold mb-3">Summary</h2>
              <p className="text-lg font-bold">
                Grand Total: ₹{calculateTotal()}
              </p>

              <div className="flex gap-4 mt-4">
                <button
                  onClick={clearCart}
                  className="flex-1 py-3 bg-gray-200 rounded-lg font-medium hover:bg-gray-300"
                >
                  Clear Cart
                </button>

                <button
                  onClick={() => alert("Checkout functionality coming soon!")}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WholesaleCart;
