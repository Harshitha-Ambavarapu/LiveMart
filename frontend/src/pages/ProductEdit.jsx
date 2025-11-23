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
    category: "Groceries",
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
        category: product.category || "Groceries",
        unit: product.unit || "kg",
      });
      setImagePreview(product.images?.[0] || "");
      setLoading(false);
    } else if (id) {
      axios
        .get(`${API_URL}/products/${id}`)
        .then((res) => {
          const p = res.data.product;
          setForm({
            ...p,
            tags: p.tags?.join(", ") || "",
            category: p.category || "Groceries",
            unit: p.unit || "kg",
          });
          setImagePreview(p.images?.[0] || "");
        })
        .catch((err) => {
          console.error(err);
          setError("Failed to load product.");
        })
        .finally(() => setLoading(false));
    } else {
      // no id - adding new product
      setLoading(false);
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

      const payload = {
        ...form,
        price: Number(form.price || 0),
        stock: Number(form.stock || 0),
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        images: imagePreview ? [imagePreview] : [],
      };

      if (id) {
        await axios.put(`${API_URL}/products/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Product updated successfully!");
      } else {
        await axios.post(`${API_URL}/products`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Product added successfully!");
      }

      navigate("/"); // or navigate back to products list
    } catch (err) {
      console.error("Save error:", err);
      setError(err.response?.data?.message || "Save failed.");
    }
  };

  if (loading) {
    return <div className="text-center mt-20">Loading product...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <div className="rounded-2xl bg-white shadow-xl overflow-hidden">
        {/* top purple accent */}
        <div className="h-2 bg-gradient-to-r from-purple-400 to-purple-600" />

        <div className="p-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-purple-600 hover:text-purple-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </button>

          <h2 className="text-3xl font-extrabold mb-6">
            {id ? "Edit Product" : "Add New Product"}
          </h2>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1: Name + Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Product Name *</label>
                <input
                  name="name"
                  placeholder="Enter Product name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border border-purple-100 bg-white px-4 py-3 rounded-xl placeholder: text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <input
                  name="description"
                  placeholder="Short description"
                  value={form.description}
                  onChange={handleChange}
                  className="w-full border border-purple-100 bg-white px-4 py-3 rounded-xl placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>
            </div>

            {/* Row 2: Category + Unit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border border-purple-100 px-4 py-3 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-200"
                >
                  <option>Groceries</option>
                  <option>Vegetables</option>
                  <option>Fruits</option>
                  <option>Dairy</option>
                  <option>Others</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Unit *</label>
                <select
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  className="w-full border border-purple-100 px-4 py-3 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-200"
                >
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="ltr">ltr</option>
                  <option value="pcs">pcs</option>
                </select>
              </div>
            </div>

            {/* Row 3: Price + Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Price (₹)</label>
                <input
                  name="price"
                  type="number"
                  placeholder=""
                  value={form.price}
                  onChange={handleChange}
                  className="w-full border border-purple-100 px-4 py-3 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Stock</label>
                <input
                  name="stock"
                  type="number"
                  value={form.stock}
                  onChange={handleChange}
                  className="w-full border border-purple-100 px-4 py-3 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>
            </div>

            {/* Image upload */}
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Product Image</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center bg-white border border-purple-100 rounded-xl px-4 py-2 cursor-pointer hover:bg-purple-50">
                    <Upload className="w-4 h-4 mr-2 text-purple-600" />
                    <span className="text-sm font-medium">Select</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>

                  <div className="w-20 h-20 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center text-gray-400">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-xs">No image</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between gap-4">
              <button
                type="submit"
                className="flex-1 inline-flex items-center justify-center gap-3 px-6 py-3 rounded-full text-white text-lg font-semibold shadow-md
                           bg-gradient-to-r from-purple-500 to-purple-400 hover:from-purple-600 hover:to-purple-500"
              >
                <span className="text-2xl leading-none">+</span>
                <span>{id ? "Save Changes" : "Add Product"}</span>
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 rounded-full border border-gray-200 bg-white text-gray-700"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-gray-400 mt-1">Fields marked * are required</p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductEdit;
