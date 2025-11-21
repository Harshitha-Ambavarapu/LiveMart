import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, MapPin } from 'lucide-react';
import axios from 'axios';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`${API_URL}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrder(response.data.order || response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Order not found</h2>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const shippingAddress = order.shippingAddress || order.deliveryAddress || {};

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-8 text-center mb-8">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-4">
            Thank you for your order. We'll send you a confirmation email shortly.
          </p>
          <p className="text-sm text-gray-500">Order ID: {order._id}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold">Shipping Address</h2>
            </div>
            <div className="space-y-1 text-gray-700">
              {shippingAddress.fullName && (
                <p className="font-semibold">{shippingAddress.fullName}</p>
              )}
              {shippingAddress.address && <p>{shippingAddress.address}</p>}
              {(shippingAddress.city || shippingAddress.postalCode) && (
                <p>
                  {shippingAddress.city}
                  {shippingAddress.postalCode && `, ${shippingAddress.postalCode}`}
                </p>
              )}
              {shippingAddress.country && <p>{shippingAddress.country}</p>}
              {shippingAddress.phone && <p>Phone: {shippingAddress.phone}</p>}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold">Order Summary</h2>
            </div>
            <div className="space-y-2 text-gray-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{(order.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>₹{(order.shippingCost || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>₹{(order.tax || 0).toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{(order.totalAmount || 0).toFixed(2)}</span>
              </div>
              <div className="border-t pt-2">
                <p className="text-sm">
                  Payment Method: <span className="font-semibold uppercase">{order.paymentMethod}</span>
                </p>
                <p className="text-sm">
                  Status: <span className="font-semibold text-green-600">
                    {order.orderStatus || order.status}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items && order.items.map((item) => (
              <div key={item._id} className="flex items-center gap-4 pb-4 border-b last:border-b-0">
                <img
                  src={item.product?.images?.[0] || 'https://via.placeholder.com/80'}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <p className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => navigate('/orders')}
            className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50"
          >
            View All Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;