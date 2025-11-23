import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, Truck, CheckCircle, XCircle, Eye } from 'lucide-react';
import axios from 'axios';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/orders/my-orders`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'confirmed':
        return <Package className="w-5 h-5 text-purple-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading orders...</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <Package className="w-24 h-24 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
        <p className="text-gray-600 mb-6">Start shopping to see your orders here!</p>
        <button
          onClick={() => navigate('/')}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">Order ID: {order._id}</p>
                  <p className="text-sm text-gray-500">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(order.orderStatus || order.status)}
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.orderStatus || order.status)}`}>
                    {(order.orderStatus || order.status).toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4 mb-4">
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item._id} className="flex items-center gap-4">
                      <img
                        src={item.product?.images?.[0] || 'https://via.placeholder.com/60'}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-purple-600">₹{order.totalAmount.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => navigate(`/order-confirmation/${order._id}`)}
                  className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;