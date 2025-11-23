import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Cart page - purple / black / white theme
 * Uses your backend routes:
 *  GET  /api/cart
 *  POST /api/cart/add    -> { productId, quantity }
 *  PUT  /api/cart/update -> { productId, quantity }
 *  DELETE /api/cart/remove/:productId
 *  DELETE /api/cart/clear
 *
 * Replace API_URL if needed.
 */

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchCart = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/cart`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setCart(res.data);
    } catch (err) {
      console.error("Fetch cart error:", err);
      setError(err.response?.data?.message || "Could not load cart.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQty = async (productId, qty) => {
    if (qty < 0) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/cart/update`,
        { productId, quantity: qty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCart();
    } catch (err) {
      console.error("Update qty error:", err);
      setError(err.response?.data?.message || "Failed to update quantity.");
    } finally {
      setActionLoading(false);
    }
  };

  const removeItem = async (productId) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchCart();
    } catch (err) {
      console.error("Remove item error:", err);
      setError(err.response?.data?.message || "Failed to remove item.");
    } finally {
      setActionLoading(false);
    }
  };

  const clearCart = async () => {
    if (!confirm("Clear the cart?")) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/cart/clear`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart({ user: cart?.user, items: [] });
    } catch (err) {
      console.error("Clear cart error:", err);
      setError("Failed to clear cart.");
    } finally {
      setActionLoading(false);
    }
  };

  const total = (cart?.items || []).reduce((acc, it) => {
    const price = it.price ?? it.product?.price ?? 0;
    const qty = it.quantity ?? 0;
    return acc + price * qty;
  }, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* header card with subtle purple accent and screenshot on the right */}
      <div className="rounded-2xl overflow-hidden shadow-lg mb-8">
        <div className="flex items-center justify-between bg-gradient-to-r from-gray-900 to-black p-5">
          <div className="text-white">
            <h1 className="text-2xl font-extrabold">Your Cart</h1>
            <p className="text-sm text-gray-300 mt-1">
              Review items and proceed to checkout
            </p>
          </div>

          <div className="hidden md:block">
            {/* reference screenshot (replace if you want a different image) */}
            <img
              src={"/mnt/data/Screenshot 2025-11-23 180318.png"}
              alt="cart visual"
              className="w-40 h-20 object-cover rounded-lg opacity-95 border border-gray-700"
            />
          </div>
        </div>

        {/* white card body */}
        <div className="bg-white p-6">
          {/* top controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-purple-50 text-purple-700 border border-purple-200"
              >
                ← Continue shopping
              </button>

              <button
                onClick={clearCart}
                disabled={actionLoading || !(cart?.items?.length > 0)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white text-gray-800 border border-gray-200 hover:shadow-sm disabled:opacity-60"
              >
                <Trash2 className="w-4 h-4" /> Clear Cart
              </button>
            </div>

            <div className="text-sm text-gray-500">
              {cart?.items?.length ?? 0} item(s)
            </div>
          </div>

          {/* list / empty state */}
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : !cart || cart.items.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center text-white mb-4">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Your cart is empty</h3>
              <p className="text-gray-500 mt-2">Add products to place an order</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* items column */}
              <div className="lg:col-span-2 space-y-4">
                {cart.items.map((item) => {
                  const product = item.product || {};
                  return (
                    <div
                      key={product._id || item.product}
                      className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:shadow-sm"
                    >
                      <div className="w-24 h-24 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border">
                        <img
                          src={product.images?.[0] || item.product?.images?.[0] || ""}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">
                              {product.name}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">{product.category || ""}</p>
                          </div>

                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900">
                              ₹{(item.price ?? product.price ?? 0).toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              Stock: {product.stock ?? "-"}
                            </div>
                          </div>
                        </div>

                        {/* qty controls & actions */}
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
                            <button
                              onClick={() =>
                                updateQty(product._id || item.product, Math.max(0, (item.quantity || 0) - 1))
                              }
                              disabled={actionLoading}
                              className="p-2 rounded-full hover:bg-gray-200"
                            >
                              <Minus className="w-4 h-4" />
                            </button>

                            <div className="px-3 text-sm font-medium">{item.quantity}</div>

                            <button
                              onClick={() =>
                                updateQty(product._id || item.product, (item.quantity || 0) + 1)
                              }
                              disabled={actionLoading || (product.stock != null && (item.quantity || 0) >= product.stock)}
                              className="p-2 rounded-full hover:bg-gray-200"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => removeItem(product._id || item.product)}
                              disabled={actionLoading}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white border border-gray-200 text-gray-700 hover:shadow-sm"
                            >
                              <Trash2 className="w-4 h-4" /> Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* summary column */}
              <aside className="bg-black text-white rounded-xl p-6 h-fit shadow-lg">
                <h3 className="text-xl font-bold mb-4">Order Summary</h3>

                <div className="flex justify-between text-sm text-gray-300 mb-2">
                  <div>Items</div>
                  <div>{cart.items.length}</div>
                </div>

                <div className="flex justify-between text-sm text-gray-300 mb-6">
                  <div>Subtotal</div>
                  <div>₹{total.toFixed(2)}</div>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <div className="text-sm text-gray-300 mb-4">
                    Shipping and taxes calculated at checkout
                  </div>

                  <button
                    onClick={() => navigate("/checkout")}
                    disabled={actionLoading}
                    className="w-full inline-flex items-center justify-center gap-3 py-3 rounded-full text-lg font-semibold
                               bg-gradient-to-r from-purple-500 to-purple-400 hover:from-purple-600 hover:to-purple-500 shadow"
                  >
                    Checkout
                  </button>

                  <button
                    onClick={() => navigate("/")}
                    className="w-full mt-3 py-3 rounded-full bg-white text-black font-medium"
                  >
                    Continue Shopping
                  </button>
                </div>
              </aside>
            </div>
          )}
        </div>
      </div>

      {/* inline error message */}
      {error && (
        <div className="mt-4 text-center text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

export default Cart;
