import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Upload } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AddProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Groceries',
    price: '',
    stock: '',
    unit: 'kg',
    isLocal: false,
    localRegion: '',
    tags: ''
  });

  const [imagePreview, setImagePreview] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

  const categories = [
    'Groceries',
    'Vegetables',
    'Fruits',
    'Dairy',
    'Bakery',
    'Beverages',
    'Snacks',
    'Other'
  ];

  const units = ['kg', 'g', 'l', 'ml', 'piece', 'pack', 'dozen'];

  if (!user || (user.role !== 'retailer' && user.role !== 'wholesaler')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold font-serif text-black-800 mb-4">Access Denied</h2>
          <p className="text-black-600 mb-6">
            You don't have permission to add products.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      const productData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: Number(formData.price),
        stock: Number(formData.stock),
        unit: formData.unit,
        isLocal: formData.isLocal,
        localRegion: formData.isLocal ? formData.localRegion : undefined,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        images: [
          imagePreview ||
          `https://via.placeholder.com/300?text=${encodeURIComponent(formData.name)}`
        ]
      };

      const res = await axios.post(`${API_URL}/products`, productData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.data.success) {
        alert('Product added successfully!');
        navigate('/');
      }
    } catch (err) {
      console.error('Add product error:', err);
      setError(err.response?.data?.message || 'Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-start justify-center py-12">
      {/* Outer card: smaller, centered, gradient, pronounced shadow */}
      <div className="w-full max-w-lg bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl ring-1 ring-purple-100/60 overflow-hidden">
        {/* decorative top gradient */}
        <div className="h-1 bg-gradient-to-r from-purple-400 via-purple-300 to-transparent" />

        <div className="px-6 py-7">
          {/* Header */}
          <div className="mb-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-purple-600 hover:text-purple-800 mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            <h1 className="text-2xl font-semibold font-serif text-gray-900">Add New Product</h1>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md mb-3 flex items-start">
              <X className="w-4 h-4 mr-2 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">

            {/* Product Name & Description side-by-side on wider screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="text-sm text-gray-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter Product name"
                  className="h-11 px-3 rounded-xl border border-purple-100 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 outline-none text-sm shadow-sm"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-700 mb-1">Description *</label>
                <input
                  type="text"
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Short description"
                  className="h-11 px-3 rounded-xl border border-purple-100 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 outline-none text-sm shadow-sm"
                />
              </div>
            </div>

            {/* Category / Unit */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-700 mb-1 block">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="h-11 w-full px-3 rounded-xl border border-purple-100 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 outline-none text-sm shadow-sm bg-white"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-700 mb-1 block">Unit *</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="h-11 w-full px-3 rounded-xl border border-purple-100 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 outline-none text-sm shadow-sm bg-white"
                >
                  {units.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            {/* Price / Stock */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-700 mb-1 block">Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  className="h-11 w-full px-3 rounded-xl border border-purple-100 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 outline-none text-sm shadow-sm"
                />
              </div>

              <div>
                <label className="text-sm text-gray-700 mb-1 block">Stock</label>
                <input
                  type="number"
                  name="stock"
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  className="h-11 w-full px-3 rounded-xl border border-purple-100 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 outline-none text-sm shadow-sm"
                />
              </div>
            </div>

            {/* Image Upload & Preview */}
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Product Image</label>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-purple-100 cursor-pointer hover:bg-purple-50 text-sm shadow-sm">
                  <Upload className="w-4 h-4" />
                  <span>Select</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>

                {imagePreview ? (
                  <img src={imagePreview} alt="preview" className="w-16 h-16 rounded-lg object-cover border border-purple-50 shadow-sm" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-50 flex items-center justify-center text-xs text-gray-400 border border-dashed border-purple-50">
                    No image
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 h-11 rounded-xl flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-medium shadow-md hover:from-purple-700 hover:to-purple-600 disabled:opacity-60"
              >
                {loading ? 'Adding...' : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Product
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-28 h-11 rounded-xl border border-purple-100 bg-white text-sm font-medium hover:bg-purple-50 shadow-sm"
              >
                Cancel
              </button>
            </div>

            {/* small footer note */}
            <p className="text-xs text-gray-400 mt-2">Fields marked * are required</p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;