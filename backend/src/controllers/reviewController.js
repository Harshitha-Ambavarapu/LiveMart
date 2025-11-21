const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Helper function to delete review images
const deleteReviewImages = (images) => {
  if (!images || images.length === 0) return;
  
  images.forEach(imagePath => {
    const fullPath = path.join(__dirname, '../../public', imagePath);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
        console.log('✅ Deleted image:', fullPath);
      } catch (err) {
        console.error('❌ Error deleting image:', err);
      }
    }
  });
};

// @desc    Get all reviews for a product
// @route   GET /api/products/:productId/reviews
// @access  Public
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { sort = '-createdAt', page = 1, limit = 10, rating } = req.query;

    const query = { product: productId, status: 'approved' };
    
    if (rating) {
      query.rating = Number(rating);
    }

    const skip = (page - 1) * limit;

    const reviews = await Review.find(query)
      .populate('user', 'name')
      .populate('sellerResponse.respondedBy', 'name role')
      .sort(sort)
      .limit(Number(limit))
      .skip(skip);

    const total = await Review.countDocuments(query);

    // Calculate rating distribution
    const ratingStats = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId), status: 'approved' } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      }
    ]);

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingStats.forEach(stat => {
      distribution[stat._id] = stat.count;
    });

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      distribution,
      reviews
    });
  } catch (error) {
    console.error('❌ Get product reviews error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new review
// @route   POST /api/products/:productId/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment, orderId } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if user already reviewed
    const existingReview = await Review.findOne({
      product: productId,
      user: req.user.id
    });

    if (existingReview) {
      return res.status(400).json({ 
        success: false,
        message: 'You have already reviewed this product. You can edit your existing review.' 
      });
    }

    // Verify purchase
    let isVerifiedPurchase = false;
    if (orderId) {
      const order = await Order.findOne({
        _id: orderId,
        user: req.user.id,
        'items.product': productId,
        status: 'delivered'
      });
      isVerifiedPurchase = !!order;
    }

    // Handle uploaded images
    const images = req.files ? req.files.map(file => `/uploads/reviews/${file.filename}`) : [];

    const review = await Review.create({
      product: productId,
      user: req.user.id,
      order: orderId,
      rating,
      title,
      comment,
      images,
      isVerifiedPurchase
    });

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name');

    res.status(201).json({
      success: true,
      review: populatedReview
    });
  } catch (error) {
    // Clean up uploaded files if review creation fails
    if (req.files) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          console.error('Error deleting uploaded file:', err);
        }
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private (Owner only)
exports.updateReview = async (req, res) => {
  try {
    const { rating, title, comment, existingImages, imagesToDelete } = req.body;
    
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check ownership
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this review' });
    }

    // ✅ Handle image deletion
    let parsedImagesToDelete = [];
    if (imagesToDelete) {
      try {
        parsedImagesToDelete = JSON.parse(imagesToDelete);
        // Delete the images from filesystem
        deleteReviewImages(parsedImagesToDelete);
      } catch (err) {
        console.error('Error parsing imagesToDelete:', err);
      }
    }

    // ✅ Parse existing images that should remain
    let remainingImages = [];
    if (existingImages) {
      try {
        remainingImages = JSON.parse(existingImages);
      } catch (err) {
        console.error('Error parsing existingImages:', err);
        remainingImages = review.images || [];
      }
    }

    // ✅ Handle new uploaded images
    const newImages = req.files ? req.files.map(file => `/uploads/reviews/${file.filename}`) : [];
    
    // ✅ Combine remaining existing images with new images (up to 5 total)
    const allImages = [...remainingImages, ...newImages].slice(0, 5);

    // Update review fields
    review.rating = rating || review.rating;
    review.title = title || review.title;
    review.comment = comment || review.comment;
    review.images = allImages;
    review.updatedAt = Date.now();

    await review.save();

    const updatedReview = await Review.findById(review._id)
      .populate('user', 'name');

    res.status(200).json({
      success: true,
      review: updatedReview
    });
  } catch (error) {
    // Clean up uploaded files if update fails
    if (req.files) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (err) {
          console.error('Error deleting uploaded file:', err);
        }
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Owner only)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check ownership
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    // Delete associated images
    deleteReviewImages(review.images);

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Private
exports.markHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const alreadyMarked = review.helpfulBy.includes(req.user.id);

    if (alreadyMarked) {
      review.helpfulBy = review.helpfulBy.filter(
        id => id.toString() !== req.user.id
      );
      review.helpful -= 1;
    } else {
      review.helpfulBy.push(req.user.id);
      review.helpful += 1;
    }

    await review.save();

    res.status(200).json({
      success: true,
      helpful: review.helpful,
      marked: !alreadyMarked
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate('product', 'name images category')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check if user can review a product
// @route   GET /api/products/:productId/can-review
// @access  Private
exports.canReviewProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const existingReview = await Review.findOne({
      product: productId,
      user: req.user.id
    });

    if (existingReview) {
      return res.status(200).json({
        success: true,
        canReview: false,
        reason: 'already_reviewed',
        existingReview
      });
    }

    const order = await Order.findOne({
      user: req.user.id,
      'items.product': productId,
      status: 'delivered'
    });

    res.status(200).json({
      success: true,
      canReview: true,
      hasPurchased: !!order,
      orderId: order?._id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add seller response to a review
// @route   POST /api/reviews/:id/seller-response
// @access  Private (Retailers/Wholesalers only)
exports.addSellerResponse = async (req, res) => {
  try {
    const { response } = req.body;

    if (!response || response.trim().length < 10) {
      return res.status(400).json({ 
        success: false, 
        message: 'Response must be at least 10 characters long' 
      });
    }

    const review = await Review.findById(req.params.id)
      .populate('product', 'seller');

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check if user is the seller of the product
    const product = await Product.findById(review.product);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Verify seller owns this product
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only the product seller can respond to reviews' 
      });
    }

    // ✅ Check if seller already responded
    if (review.sellerResponse && review.sellerResponse.comment) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already responded to this review. You can only respond once.' 
      });
    }

    // Add seller response
    review.sellerResponse = {
      comment: response.trim(),
      respondedBy: req.user.id,
      respondedAt: new Date()
    };

    await review.save();

    const updatedReview = await Review.findById(review._id)
      .populate('user', 'name')
      .populate('sellerResponse.respondedBy', 'name role');

    res.status(200).json({
      success: true,
      message: 'Response added successfully',
      review: updatedReview
    });
  } catch (error) {
    console.error('Add seller response error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};