const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Groceries', 
      'Vegetables', 
      'Fruits', 
      'Dairy', 
      'Bakery', 
      'Beverages', 
      'Snacks',
      'Personal Care',
      'Household',
      'Electronics',
      'Clothing',
      'Other'
    ]
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: 0,
    default: 0
  },
  unit: {
    type: String,
    default: 'piece',
    enum: ['kg', 'g', 'l', 'ml', 'piece', 'dozen', 'pack']
  },
  images: [{
    type: String
  }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  sellerRole: {
    type: String,
    enum: ['retailer', 'wholesaler'],
    required: false
  },
  isLocal: {
    type: Boolean,
    default: false
  },
  localRegion: {
    type: String
  },
  availableDate: {
    type: Date,
    default: Date.now
  },
  minOrderQuantity: {
    type: Number,
    default: 1
  },
  maxOrderQuantity: {
    type: Number
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
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

// Update averageRating when rating is added
productSchema.methods.calculateAverageRating = function() {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    this.totalReviews = 0;
  } else {
    const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
    this.averageRating = (sum / this.ratings.length).toFixed(1);
    this.totalReviews = this.ratings.length;
  }
};

// Text index for search
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);