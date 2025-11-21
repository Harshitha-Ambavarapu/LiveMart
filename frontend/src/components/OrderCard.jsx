import React from "react";
import { useNavigate } from "react-router-dom";

export default function OrderCard({ order, onConfirm }) {
  const navigate = useNavigate();

  return (
    <div className="p-4 bg-white shadow rounded border">
      <h2 className="text-lg font-semibold">Order #{order._id}</h2>
      <p>Customer: {order.customer?.name}</p>
      <p>Status: <strong>{order.status}</strong></p>
      <p>Total: ₹{order.totalAmount}</p>

      <div className="flex gap-3 mt-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => navigate(`/order/${order._id}`)}
        >
          View Details
        </button>

        {order.status === "pending" && (
          <button
            className="px-4 py-2 bg-green-600 text-white rounded"
            onClick={() => onConfirm(order._id)}
          >
            Confirm Order
          </button>
        )}
      </div>
    </div>
  );
}
