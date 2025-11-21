import React, { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronDown, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/common/ProductCard';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Categories available in your seed data
  const categories = [
    'All Categories',
    'Groceries',
    'Vegetables',
    'Fruits',
    'Dairy',
    'Bakery',
    'Beverages',
    'Snacks'
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  // Apply filters whenever filter criteria changes
  useEffect(() => {
    applyFilters();
  }, [products, searchTerm, selectedCategory, priceRange, sortBy]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/products`);
      setProducts(res.data.products);
      setFilteredProducts(res.data.products);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'All Categories') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Price range filter
    if (priceRange.min !== '') {
      filtered = filtered.filter(product => product.price >= Number(priceRange.min));
    }
    if (priceRange.max !== '') {
      filtered = filtered.filter(product => product.price <= Number(priceRange.max));
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setFilteredProducts(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setPriceRange({ min: '', max: '' });
    setSortBy('createdAt');
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setPriceRange(prev => ({ ...prev, [name]: value }));
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Product deleted successfully!');
      fetchProducts(); // Refresh products
    } catch (error) {
      console.error('Error deleting product:', error);
      alert(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleEditProduct = (product) => {
    // Navigate to edit page with product ID
    navigate(`/edit-product/${product._id}`, { state: { product } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isSeller = user?.role === 'retailer' || user?.role === 'wholesaler';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Add Product Button */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome, {user?.name || 'Guest'}!
            </h1>
            <p className="text-gray-600 mt-1">
              {isSeller ? 'Manage your products' : 'Browse fresh products from local sellers'}
            </p>
          </div>

          {/* Add Product Button - Only for Sellers */}
          {isSeller && (
            <button
              onClick={() => navigate('/add-product')}
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 active:scale-95 transition-all shadow-md"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </button>
          )}
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products by name, category, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative w-full md:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                <option value="createdAt">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                showFilters
                  ? 'bg-blue-700 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
              {(selectedCategory || priceRange.min || priceRange.max) && (
                <span className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {[selectedCategory, priceRange.min, priceRange.max].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t">
              {/* Category Chips */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Filter by Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat === 'All Categories' ? '' : cat)}
                      className={`px-4 py-2 rounded-full font-medium transition-all ${
                        (cat === 'All Categories' && !selectedCategory) || selectedCategory === cat
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Min Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Price (₹)
                  </label>
                  <input
                    type="number"
                    name="min"
                    value={priceRange.min}
                    onChange={handlePriceChange}
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Max Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Price (₹)
                  </label>
                  <input
                    type="number"
                    name="max"
                    value={priceRange.max}
                    onChange={handlePriceChange}
                    placeholder="1000"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Clear Filters Button */}
              <div className="flex justify-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Clear All Filters</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Active Filters Display */}
        {(selectedCategory || priceRange.min || priceRange.max || searchTerm) && (
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600 font-medium">Active filters:</span>
            {searchTerm && (
              <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-2 hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedCategory && (
              <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {selectedCategory}
                <button
                  onClick={() => setSelectedCategory('')}
                  className="ml-2 hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {priceRange.min && (
              <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                Min: ₹{priceRange.min}
                <button
                  onClick={() => setPriceRange(prev => ({ ...prev, min: '' }))}
                  className="ml-2 hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {priceRange.max && (
              <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                Max: ₹{priceRange.max}
                <button
                  onClick={() => setPriceRange(prev => ({ ...prev, max: '' }))}
                  className="ml-2 hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {selectedCategory || 'All Products'}
          </h2>
          <p className="text-gray-600">
            Showing <span className="font-semibold text-blue-600">{filteredProducts.length}</span> of {products.length} products
          </p>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Filter className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">
              No products match your current filter criteria
            </p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-semibold"
            >
              <X className="w-4 h-4" />
              <span>Clear all filters</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product._id}
                product={product}
                currentUser={user}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;