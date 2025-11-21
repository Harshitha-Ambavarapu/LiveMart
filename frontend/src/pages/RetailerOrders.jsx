// src/pages/RetailerOrders.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import OrderCard from "../components/OrderCard";
import { useAuth } from "../context/AuthContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export default function RetailerOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");

      // ✅ FIXED ROUTE
      const res = await axios.get(`${API_URL}/orders/incoming`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(res.data.orders || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

const confirmOrder = async (orderId) => {
  try {
    const token = localStorage.getItem("token");

    await axios.put(
      `${API_URL}/orders/${orderId}/confirm`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Order confirmed!");
    fetchOrders(); // refresh
  } catch (err) {
    console.error("Error confirming order:", err.response?.data || err);
    alert("Failed to confirm order");
  }
};


  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Incoming Orders ({orders.length})
      </h1>

      {orders.length === 0 ? (
        <p className="text-gray-600">No orders yet.</p>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onConfirm={confirmOrder}
            />
          ))}
        </div>
      )}
    </div>
  );
}
