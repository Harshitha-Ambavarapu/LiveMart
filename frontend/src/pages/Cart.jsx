import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, loading, updateQuantity, removeFromCart, getCartTotal } = useCart();

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateQuantity(productId, newQuantity);
  };

  const handleRemove = async (productId) => {
    await removeFromCart(productId);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading cart...</div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <ShoppingBag className="w-24 h-24 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Add some products to get started!</p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Browse Products
        </button>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const shipping = subtotal > 500 ? 0 : 50;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              {cart.map((item) => (
                <div key={item.product._id} className="flex items-center gap-4 p-4 border-b">
                  <img
                    src={item.product.images?.[0] || 'https://via.placeholder.com/100'}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded"
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.product.name}</h3>
                    <p className="text-gray-600">₹{item.price}</p>
                    <p className="text-sm text-gray-500">
                      {item.product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                      className="p-1 rounded border hover:bg-gray-100"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                      className="p-1 rounded border hover:bg-gray-100"
                      disabled={item.quantity >= item.product.stock}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold text-lg">₹{(item.price * item.quantity).toFixed(2)}</p>
                    <button
                      onClick={() => handleRemove(item.product._id)}
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
                  <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
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
              
              {subtotal < 500 && (
                <p className="text-sm text-gray-600 mb-4">
                  Add ₹{(500 - subtotal).toFixed(2)} more for free shipping!
                </p>
              )}
              
              <button
                onClick={handleCheckout}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
              >
                Proceed to Checkout
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="w-full mt-3 border border-gray-300 py-3 rounded-lg hover:bg-gray-50"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;