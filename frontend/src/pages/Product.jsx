import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Loader, ArrowLeft, Plus, Minus, MessageSquare, X, ZoomIn } from 'lucide-react';
import StarRating from '../components/common/StarRating';
import ReviewForm from '../components/common/ReviewForm';
import ReviewList from '../components/common/ReviewList';

export default function Product() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  
  // Review states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [filterRating, setFilterRating] = useState(null);
  
  const API_URL = 'http://localhost:4000/api';

  const fetchProduct = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/products/${id}`);
      if (!res.ok) throw new Error('Failed to fetch product details');
      const data = await res.json();
      setProduct(data.product);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, API_URL]);

  const fetchReviews = useCallback(async (rating = null) => {
    try {
      const url = rating 
        ? `${API_URL}/products/${id}/reviews?rating=${rating}`
        : `${API_URL}/products/${id}/reviews`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        setReviews(data.reviews);
        setReviewStats(data.distribution);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  }, [id, API_URL]);

  const checkCanReview = useCallback(async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/products/${id}/can-review`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        setCanReview(data.canReview);
        if (data.existingReview) {
          setExistingReview(data.existingReview);
        }
      }
    } catch (err) {
      console.error('Failed to check review status:', err);
    }
  }, [id, user, API_URL]);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    checkCanReview();
  }, [fetchProduct, fetchReviews, checkCanReview]);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      const result = await addToCart(product._id, quantity);
      if (result.success) {
        alert('Product added to cart successfully!');
        setQuantity(1);
      } else {
        alert(result.error || 'Failed to add to cart');
      }
    } catch (error) {
      alert('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    fetchProduct();
    fetchReviews(filterRating);
    checkCanReview();
  };

  const handleEditReview = (review) => {
    setExistingReview(review);
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete your review?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert('Review deleted successfully!');
        fetchProduct();
        fetchReviews(filterRating);
        checkCanReview();
      } else {
        alert(data.message || 'Failed to delete review');
      }
    } catch (err) {
      console.error('Failed to delete review:', err);
      alert('Failed to delete review');
    }
  };

  const handleHelpful = async (reviewId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        fetchReviews(filterRating);
      }
    } catch (err) {
      console.error('Failed to mark helpful:', err);
    }
  };

  const handleRefresh = () => {
    fetchProduct();
    fetchReviews(filterRating);
  };

  const handleFilterChange = (rating) => {
    setFilterRating(rating === filterRating ? null : rating);
    fetchReviews(rating === filterRating ? null : rating);
  };

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600 text-lg">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-red-600 text-lg font-semibold mb-4">{error || 'Product not found'}</p>
        <Link to="/" className="text-blue-600 hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>

        {/* Product Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
          {/* Product Image - CLICKABLE TO ENLARGE */}
          <div 
            className="bg-white rounded-lg shadow-lg overflow-hidden relative group cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => setImageModalOpen(true)}
          >
            <img
              src={product.images?.[0] || 'https://via.placeholder.com/400?text=No+Image'}
              alt={product.name}
              className="w-full h-[500px] object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
              <div className="bg-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                <ZoomIn className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white text-xs px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              Click to enlarge
            </div>
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">{product.name}</h1>
            <p className="text-gray-500 text-sm mb-4 uppercase tracking-wide">{product.category}</p>

            {/* Rating */}
            {product.averageRating > 0 && (
              <div className="flex items-center gap-3 mb-6 pb-6 border-b">
                <StarRating rating={product.averageRating} size="lg" showNumber />
                <span className="text-sm text-gray-600">
                  ({product.totalReviews} {product.totalReviews === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}

            <p className="text-lg text-gray-700 mb-6 leading-relaxed">{product.description}</p>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6 bg-blue-50 p-4 rounded-lg">
              <span className="text-4xl font-bold text-blue-600">₹{product.price}</span>
              <span className="text-gray-600 text-lg">/ {product.unit}</span>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Availability:</p>
              <span className={`inline-block px-4 py-2 rounded-full font-semibold ${
                product.stock > 10 ? 'bg-green-100 text-green-700' : 
                product.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 
                'bg-red-100 text-red-700'
              }`}>
                {product.stock > 10 ? `In Stock (${product.stock} available)` : 
                 product.stock > 0 ? `Low Stock (${product.stock} left)` : 
                 'Out of Stock'}
              </span>
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 mb-3 block">Quantity:</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    className="p-3 rounded-lg border-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="w-16 text-center font-bold text-2xl">{quantity}</span>
                  <button
                    onClick={increaseQuantity}
                    disabled={quantity >= product.stock}
                    className="p-3 rounded-lg border-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || addingToCart}
              className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                product.stock === 0 || addingToCart
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] shadow-lg hover:shadow-xl'
              }`}
            >
              <ShoppingCart className="w-6 h-6" />
              {addingToCart ? 'Adding to Cart...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>

        {/* REVIEWS SECTION */}
        <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-blue-600">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-blue-600" />
              Customer Reviews
            </h2>
            
            {user && canReview && !existingReview && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md hover:shadow-lg transition-all"
              >
                Write a Review
              </button>
            )}
            
            {user && existingReview && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium shadow-md hover:shadow-lg transition-all"
              >
                Edit Your Review
              </button>
            )}
          </div>

          {/* No reviews message */}
          {(!reviews || reviews.length === 0) && (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <MessageSquare className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-xl mb-2 font-semibold">No reviews yet</p>
              <p className="text-gray-500">Be the first to review this product!</p>
            </div>
          )}

          {/* Rating Summary */}
          {product.totalReviews > 0 && (
            <div className="mb-10 pb-8 border-b-2">
              <div className="flex items-center gap-12">
                <div className="text-center bg-blue-50 p-6 rounded-lg">
                  <div className="text-6xl font-bold text-blue-600 mb-3">
                    {product.averageRating}
                  </div>
                  <StarRating rating={product.averageRating} size="lg" />
                  <p className="text-sm text-gray-600 mt-3 font-medium">
                    Based on {product.totalReviews} {product.totalReviews === 1 ? 'review' : 'reviews'}
                  </p>
                </div>

                {/* Rating Distribution */}
                {reviewStats && (
                  <div className="flex-1 space-y-3">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviewStats[star] || 0;
                      const percentage = product.totalReviews > 0 
                        ? (count / product.totalReviews) * 100 
                        : 0;
                      
                      return (
                        <button
                          key={star}
                          onClick={() => handleFilterChange(star)}
                          className={`flex items-center gap-3 w-full hover:bg-gray-50 p-3 rounded-lg transition-colors ${
                            filterRating === star ? 'bg-blue-50 ring-2 ring-blue-300' : ''
                          }`}
                        >
                          <span className="text-sm font-semibold w-12">{star} ★</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-yellow-400 h-3 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-16 font-medium">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Filter Message */}
          {filterRating && (
            <div className="mb-6 flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 font-medium">
                Showing {filterRating}-star reviews only
              </p>
              <button
                onClick={() => handleFilterChange(null)}
                className="text-sm text-blue-600 hover:text-blue-800 font-semibold underline"
              >
                Clear filter
              </button>
            </div>
          )}

          {/* Reviews List */}
          {reviews && reviews.length > 0 && (
            <ReviewList 
              reviews={reviews} 
              onHelpful={handleHelpful}
              onEdit={handleEditReview}
              onDelete={handleDeleteReview}
              onRefresh={handleRefresh}
              productSellerId={product.seller}
            />
          )}
        </div>
      </div>

      {/* Image Zoom Modal */}
      {imageModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
          onClick={() => setImageModalOpen(false)}
        >
          <button
            onClick={() => setImageModalOpen(false)}
            className="absolute top-6 right-6 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2"
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={product.images?.[0] || 'https://via.placeholder.com/400?text=No+Image'}
            alt={product.name}
            className="max-w-[90%] max-h-[90%] object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Review Form Modal */}
      {showReviewForm && (
        <ReviewForm
          productId={id}
          existingReview={existingReview}
          onSuccess={handleReviewSuccess}
          onCancel={() => setShowReviewForm(false)}
        />
      )}
    </div>
  );
}