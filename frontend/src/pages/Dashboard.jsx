import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Retailer Dashboard Links */}
      {user?.role === "retailer" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            onClick={() => navigate("/retailer/orders")}
            className="p-6 bg-white rounded-lg shadow hover:shadow-lg cursor-pointer transition-all"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Incoming Orders
            </h3>
            <p className="text-gray-600">
              View and confirm customer orders
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
