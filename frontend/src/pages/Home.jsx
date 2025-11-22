import React, { useState, useEffect } from 'react';
import { Filter, X, ChevronDown, Plus, SlidersHorizontal } from 'lucide-react';
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
  const [sortBy, setSortBy] = useState('createdAt');

  const [showSortPrice, setShowSortPrice] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory && selectedCategory !== 'All Categories') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (priceRange.min !== '') {
      filtered = filtered.filter(product => product.price >= Number(priceRange.min));
    }
    if (priceRange.max !== '') {
      filtered = filtered.filter(product => product.price <= Number(priceRange.max));
    }

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
  
  const clearSortPrice = () => {
    setPriceRange({ min: '', max: '' });
    setSortBy('createdAt');
    setShowSortPrice(false);
  }

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
      fetchProducts(); 
    } catch (error) {
      console.error('Error deleting product:', error);
      alert(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleEditProduct = (product) => {
    navigate(`/edit-product/${product._id}`, { state: { product } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const isSeller = user?.role === 'retailer' || user?.role === 'wholesaler';

  return (
    <div className="min-h-screen bg-[#F3F6F7]">
      <div className="container mx-auto px-4 py-8">

        {/* ---------------- HEADER ---------------- */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-6xl font-serif font-extrabold text-gray-800">
                Welcome, {user?.name || 'Guest'}!
              </h1>
              {user && (
                <span className="inline-block mt-2 text-sm font-medium text-gray-700 bg-gray-200 px-3 py-1 rounded-full capitalize">
                  {user.role}
                </span>
              )}
            </div>

            {isSeller && (
              <button
                onClick={() => navigate('/add-product')}
                className="flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 shadow-md transition-all active:scale-95"
              >
                <Plus className="w-5 h-5" />
                Add Product
              </button>
            )}
          </div>
        </div>

        {/* ---------------- GRID START ---------------- */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">

          {/* ------------ LEFT SIDEBAR (Under Welcome) ------------ */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4">

              {/* CATEGORY FILTERS */}
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Filter by Category
              </label>

              <div className="flex flex-col gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat === 'All Categories' ? '' : cat)}
                    className={`w-full text-left px-4 py-2 rounded-xl font-medium transition-all ${
                      (cat === 'All Categories' && !selectedCategory) || selectedCategory === cat
                        ? 'bg-gray-700  text-white shadow-md'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* SORT PRICE BUTTON */}
              <button
                onClick={() => setShowSortPrice(!showSortPrice)}
                className={`flex items-center gap-2 w-full mt-6 px-4 py-2 rounded-md text-white transition ${
                 showSortPrice ? 'bg-gray-800 text-white shadow-md' :  'bg-gray-600 text-gray-800 hover:bg-gray-600'
                 }`}

              >
                <SlidersHorizontal className="w-5 h-5" />
                Sort & Price
              </button>

              {/* SORT PRICE PANEL */}
              {showSortPrice && (
                <div className="mt-4 border-t pt-4">

                  {/* Sort */}
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full mb-4 px-3 py-2 border rounded-md"
                  >
                    <option value="createdAt">Newest First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name">Name: A to Z</option>
                  </select>

                  {/* Price Inputs */}
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Price
                  </label>
                  <input
                    type="number"
                    name="min"
                    value={priceRange.min}
                    onChange={handlePriceChange}
                    className="w-full px-3 py-2 border rounded-md mb-4"
                  />

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Price
                  </label>
                  <input
                    type="number"
                    name="max"
                    value={priceRange.max}
                    onChange={handlePriceChange}
                    className="w-full px-3 py-2 border rounded-md mb-3"
                  />

                  <button
                    onClick={clearSortPrice}
                    className="w-full mt-2 flex items-center justify-center gap-2 text-purple-700 border border-purple-300 px-4 py-2 rounded-md"
                  >
                    <X className="w-4 h-4" />
                    Clear Sort & Price
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ------------ RIGHT CONTENT (PRODUCT LIST) ------------ */}
          <div className="md:col-span-4">

            {/* ACTIVE FILTERS */}
            {(selectedCategory || priceRange.min || priceRange.max || sortBy !== 'createdAt') && (
              <div className="mb-4 flex flex-wrap gap-2 items-center">
                <span className="text-sm text-gray-600 font-medium">Active filters:</span>

                {selectedCategory && (
                  <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    {selectedCategory}
                    <button
                      onClick={() => setSelectedCategory('')}
                      className="ml-2 hover:bg-purple-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {priceRange.min && (
                  <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    Min: ₹{priceRange.min}
                    <button
                      onClick={() => setPriceRange(prev => ({ ...prev, min: '' }))}
                      className="ml-2 hover:bg-purple-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {priceRange.max && (
                  <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    Max: ₹{priceRange.max}
                    <button
                      onClick={() => setPriceRange(prev => ({ ...prev, max: '' }))}
                      className="ml-2 hover:bg-purple-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {sortBy !== 'createdAt' && (
                  <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    Sort: {
                      sortBy === 'price-asc' ? 'Price Low to High' :
                      sortBy === 'price-desc' ? 'Price High to Low' :
                      sortBy === 'name' ? 'Name A to Z' : ''
                    }
                    <button
                      onClick={() => setSortBy('createdAt')}
                      className="ml-2 hover:bg-purple-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* RESULTS COUNT */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedCategory || 'All Products'}
              </h2>
              <p className="text-gray-600">
                Showing <span className="font-semibold text-purple-600">{filteredProducts.length}</span> of {products.length} products
              </p>
            </div>

            {/* PRODUCT GRID */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Filter className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">No products match your current filter criteria</p>

                <button
                  onClick={clearFilters}
                  className="inline-flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 font-semibold"
                >
                  <X className="w-4 h-4" />
                  <span>Clear all filters</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </div>
    </div>
  );
};

export default Home;
