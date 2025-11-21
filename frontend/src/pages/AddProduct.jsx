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

  // Check if user is authorized
  if (!user || (user.role !== 'retailer' && user.role !== 'wholesaler')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have permission to add products.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
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
      // For now, we'll use placeholder images
      // In production, you'd upload to a service like Cloudinary or AWS S3
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
      
      // Prepare product data
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
        // For now, use a placeholder image
        images: [imagePreview || `https://via.placeholder.com/300?text=${encodeURIComponent(formData.name)}`]
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Products
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Add New Product</h1>
          <p className="text-gray-600 mt-2">Fill in the details to add a new product to your inventory</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-start">
            <X className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Fresh Tomatoes"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Describe your product in detail..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category and Unit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit *
              </label>
              <select
                name="unit"
                required
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (₹) *
              </label>
              <input
                type="number"
                name="price"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                name="stock"
                required
                min="0"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Local Product Checkbox */}
          <div className="border-t pt-6">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="isLocal"
                checked={formData.isLocal}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <span className="font-medium text-gray-700">Mark as Local Product</span>
                <p className="text-sm text-gray-500">This product is sourced locally</p>
              </div>
            </label>

            {formData.isLocal && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Local Region
                </label>
                <input
                  type="text"
                  name="localRegion"
                  value={formData.localRegion}
                  onChange={handleChange}
                  placeholder="e.g., Mumbai, Maharashtra"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="organic, fresh, premium"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">Separate tags with commas</p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Image
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                <Upload className="w-5 h-5 mr-2 text-gray-600" />
                <span className="text-gray-700">Choose Image</span>
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
                  className="w-20 h-20 object-cover rounded-md border"
                />
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              If no image is uploaded, a placeholder will be used
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Adding Product...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Add Product
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;