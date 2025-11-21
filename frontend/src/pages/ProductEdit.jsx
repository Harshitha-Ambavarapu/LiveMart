import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Upload } from "lucide-react";

const ProductEdit = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [imagePreview, setImagePreview] = useState("");

  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
    category: "",
    unit: "kg",
    isLocal: false,
    localRegion: "",
    tags: "",
  });

  // Load product either from router state or by API
  useEffect(() => {
    const product = location.state?.product;

    if (product) {
      setForm({
        ...product,
        tags: product.tags?.join(", ") || "",
      });
      setImagePreview(product.images?.[0] || "");
      setLoading(false);
    } else {
      axios.get(`${API_URL}/products/${id}`).then((res) => {
        const p = res.data.product;
        setForm({
          ...p,
          tags: p.tags?.join(", ") || "",
        });
        setImagePreview(p.images?.[0] || "");
        setLoading(false);
      });
    }
  }, [id, location.state]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle image upload (Base64 preview)
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result); // base64 image
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const token = localStorage.getItem("token");

      const updatedData = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        images: [imagePreview], // uploading base64 or old URL
      };

      await axios.put(`${API_URL}/products/${id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Product updated successfully!");
      navigate("/");
    } catch (err) {
      console.error("Edit error:", err);
      setError(err.response?.data?.message || "Update failed.");
    }
  };

  if (loading) {
    return <div className="text-center mt-20">Loading product...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 mt-10 bg-white shadow rounded">
      <button
        onClick={() => navigate("/")}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
      >
        <ArrowLeft className="w-5 h-5 mr-2" /> Back
      </button>

      <h2 className="text-3xl font-bold mb-4">Edit Product</h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block font-medium mb-1">Product Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />
        </div>

        {/* Price + Stock */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Price (₹)</label>
            <input
              name="price"
              value={form.price}
              onChange={handleChange}
              type="number"
              className="w-full border p-3 rounded"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Stock</label>
            <input
              name="stock"
              value={form.stock}
              onChange={handleChange}
              type="number"
              className="w-full border p-3 rounded"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block font-medium mb-1">Category</label>
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea
            name="description"
            rows="3"
            value={form.description}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block font-medium mb-1">Tags (comma separated)</label>
          <input
            name="tags"
            value={form.tags}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block font-medium mb-2">Product Image</label>

          <div className="flex items-center gap-4">
            <label className="flex items-center px-4 py-2 border rounded cursor-pointer hover:bg-gray-50">
              <Upload className="w-5 h-5 mr-2" />
              Change Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded border"
              />
            )}
          </div>
        </div>

        {/* Save */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 text-lg font-semibold"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default ProductEdit;
