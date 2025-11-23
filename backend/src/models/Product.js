// backend/src/models/Product.js
const mongoose = require('mongoose');

const allowedCategories = [
  'Groceries',
  'Vegetables',
  'Fruits',
  'Dairy',
  'Bakery',
  'Snacks and drinks',
  'Snacks', // accept the shorter variant too
  'Personal Care',
  'Household',
  'Other'
];

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: allowedCategories,
        message: '`{VALUE}` is not a valid category'
      }
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
    images: [
      {
        type: String
      }
    ],
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
    ratings: [
      {
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
      }
    ],
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
    }
  },
  {
    timestamps: true
  }
);

// Normalize category before validation:
// - Trim whitespace
// - Map common casing/variant forms to canonical enum value
productSchema.pre('validate', function (next) {
  if (!this.category) return next();

  const raw = String(this.category).trim();

  // canonical mapping: lowercased key => allowed value
  const map = {};
  allowedCategories.forEach((c) => {
    map[c.toLowerCase()] = c;
  });

  // direct match (case-insensitive)
  const direct = map[raw.toLowerCase()];
  if (direct) {
    this.category = direct;
    return next();
  }

  // common synonyms mapping (add more if your UI uses other labels)
  const synonyms = {
    snacks: 'Snacks and drinks', // map the UI label 'Snacks' to 'Snacks and drinks' if you prefer canonicalizing
    'snacks and drinks': 'Snacks and drinks',
    grocery: 'Groceries',
    groceries: 'Groceries',
    veg: 'Vegetables',
    vegetables: 'Vegetables',
    fruits: 'Fruits',
    dairy: 'Dairy',
    bakery: 'Bakery',
    'personal care': 'Personal Care',
    household: 'Household'
  };

  const mapped = synonyms[raw.toLowerCase()];
  if (mapped) {
    // if mapped value is in allowedCategories, use it
    if (map[mapped.toLowerCase()]) {
      this.category = map[mapped.toLowerCase()];
      return next();
    }
    // otherwise assign mapped string (it will pass enum only if included in allowedCategories)
    this.category = mapped;
    return next();
  }

  // Try contains-based fallback (if raw contains a known category name)
  const found = allowedCategories.find((c) =>
    raw.toLowerCase().includes(c.toLowerCase())
  );
  if (found) {
    this.category = found;
    return next();
  }

  // leave as-is so Mongoose enum validation will throw if truly invalid
  return next();
});

// Update averageRating when rating is added or changed
productSchema.methods.calculateAverageRating = function () {
  if (!this.ratings || this.ratings.length === 0) {
    this.averageRating = 0;
    this.totalReviews = 0;
  } else {
    const sum = this.ratings.reduce((acc, r) => acc + (r.rating || 0), 0);
    const avg = sum / this.ratings.length;
    // store as a number rounded to 1 decimal place
    this.averageRating = Math.round(avg * 10) / 10;
    this.totalReviews = this.ratings.length;
  }
};

// Text index for search
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
