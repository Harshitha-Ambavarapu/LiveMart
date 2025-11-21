const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: false
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  title: {
    type: String,
    trim: true,
    maxlength: 100
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    minlength: 10,
    maxlength: 1000
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  helpful: {
    type: Number,
    default: 0
  },
  helpfulBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  images: [{
    type: String
  }],
  // ✅ NEW: Seller Response Field
  sellerResponse: {
    comment: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: {
      type: Date
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent duplicate reviews
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Update product rating after save
reviewSchema.post('save', async function() {
  await this.constructor.updateProductRating(this.product);
});

// Update product rating after delete
reviewSchema.post('remove', async function() {
  await this.constructor.updateProductRating(this.product);
});

// Calculate and update product's average rating
reviewSchema.statics.updateProductRating = async function(productId) {
  const Product = mongoose.model('Product');
  
  const stats = await this.aggregate([
    { $match: { product: productId, status: 'approved' } },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      averageRating: stats[0].averageRating.toFixed(1),
      totalReviews: stats[0].totalReviews
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      averageRating: 0,
      totalReviews: 0
    });
  }
};

module.exports = mongoose.model('Review', reviewSchema);