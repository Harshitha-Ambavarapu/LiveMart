import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrder(res.data.order);
    };
    fetchOrder();
  }, [id]);

  if (!order) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Order Details</h1>

      <p><strong>Order ID:</strong> {order._id}</p>
      <p><strong>Status:</strong> {order.status}</p>
      <p><strong>Total Amount:</strong> ₹{order.totalAmount}</p>

      <h2 className="text-xl font-semibold mt-4">Customer Info</h2>
      <p>Name: {order.customer.name}</p>
      <p>Email: {order.customer.email}</p>
      <p>Phone: {order.customer.phone}</p>

      <h2 className="text-xl font-semibold mt-4">Delivery Address</h2>
      {order.deliveryAddress ? (
        <div className="text-gray-700">
          <p>{order.deliveryAddress.address}</p>
          <p>{order.deliveryAddress.city}</p>
          <p>{order.deliveryAddress.state} - {order.deliveryAddress.pincode}</p>
        </div>
      ) : (
        <p>No delivery address</p>
      )}

      <h2 className="text-xl font-semibold mt-4">Items</h2>
      {order.items.map((item) => (
        <div key={item._id} className="p-3 border-b">
          <p><strong>{item.name}</strong></p>
          <p>Qty: {item.quantity}</p>
          <p>Price: ₹{item.price}</p>
          <p>Subtotal: ₹{item.subtotal}</p>
        </div>
      ))}
    </div>
  );
}
