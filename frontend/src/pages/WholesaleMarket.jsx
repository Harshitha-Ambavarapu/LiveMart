// src/pages/WholesaleMarket.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../components/common/ProductCard";
import { useAuth } from "../context/AuthContext";

const WholesaleMarket = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    const fetchWholesaleProducts = async () => {
      try {
        const res = await axios.get(`${API_URL}/products?sellerRole=wholesaler`);
        setProducts(res.data.products || []);
      } catch (err) {
        console.error("Wholesale fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWholesaleProducts();
  }, []);

  if (user?.role !== "retailer") {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
        Access Denied – Retailers Only
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Wholesale Market</h1>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          </div>
        ) : products.length === 0 ? (
          <p className="text-gray-600 text-lg">No wholesaler products available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WholesaleMarket;
