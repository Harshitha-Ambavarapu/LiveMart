const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      inStock,
      isLocal,
      sellerRole,
      sellerId,
      page = 1,
      limit = 20,
      sort = '-createdAt'
    } = req.query;

    const query = { isActive: true };

    // Search by name, description, tags
    if (search) {
      query.$text = { $search: search };
    }

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    }

    if (isLocal === 'true') {
      query.isLocal = true;
    }

    if (sellerRole) {
      query.sellerRole = sellerRole;
    }

    if (sellerId) {
      query.seller = sellerId;
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .populate('seller', 'name businessDetails location')
      .sort(sort)
      .limit(Number(limit))
      .skip(skip);

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      products
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name email phone businessDetails location')
      .populate('ratings.user', 'name');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Create product
// @route   POST /api/products
// @access  Private (Retailer/Wholesaler)
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      stock,
      unit,
      isLocal,
      localRegion,
      tags,
      images
    } = req.body;

    // Validate required fields
    if (!name || !description || !category || price === undefined || stock === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // FIX: Ensure images always have something
    const imageArray =
      images && Array.isArray(images) && images.length > 0
        ? images
        : [`https://via.placeholder.com/300?text=${encodeURIComponent(name)}`];

    // Create product
    const product = await Product.create({
      name,
      description,
      category,
      price,
      stock,
      unit,
      isLocal,
      localRegion,
      tags,
      images: imageArray,
      seller: req.user._id,      // IMPORTANT FIX
      sellerRole: req.user.role, // IMPORTANT FIX
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product
    });

  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({ message: error.message });
  }
};


// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Owner only)
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check ownership
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Owner only)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    // Soft delete
    product.isActive = false;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add product rating
// @route   POST /api/products/:id/ratings
// @access  Private
exports.addRating = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already rated
    const existingRating = product.ratings.find(
      r => r.user.toString() === req.user.id
    );

    if (existingRating) {
      existingRating.rating = rating;
      existingRating.comment = comment;
    } else {
      product.ratings.push({
        user: req.user.id,
        rating,
        comment
      });
    }

    product.calculateAverageRating();
    await product.save();

    res.status(200).json({
      success: true,
      averageRating: product.averageRating,
      totalReviews: product.totalReviews
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get retailer's available products (own + wholesaler)
// @route   GET /api/products/retailer/available
// @access  Private (Retailer only)
exports.getRetailerAvailableProducts = async (req, res) => {
  try {
    // Get retailer's own products
    const ownProducts = await Product.find({
      seller: req.user.id,
      isActive: true
    });

    // Get wholesaler products
    const wholesalerProducts = await Product.find({
      seller: { $in: req.user.connectedWholesalers || [] },
      isActive: true,
      stock: { $gt: 0 }
    }).populate('seller', 'name businessDetails');

    res.status(200).json({
      success: true,
      ownInventory: ownProducts,
      wholesalerInventory: wholesalerProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get products by location
// @route   GET /api/products/nearby
// @access  Public
exports.getNearbyProducts = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 10000 } = req.query; // maxDistance in meters

    if (!longitude || !latitude) {
      return res.status(400).json({ message: 'Please provide longitude and latitude' });
    }

    const products = await Product.find({
      isActive: true,
      stock: { $gt: 0 }
    }).populate('seller', 'name location businessDetails');

    // Filter by distance
    const nearbyProducts = products.filter(product => {
      if (product.seller.location && product.seller.location.coordinates) {
        const [sellerLon, sellerLat] = product.seller.location.coordinates;
        const distance = calculateDistance(
          Number(latitude),
          Number(longitude),
          sellerLat,
          sellerLon
        );
        return distance <= maxDistance / 1000; // Convert to km
      }
      return false;
    });

    res.status(200).json({
      success: true,
      count: nearbyProducts.length,
      products: nearbyProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function - Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}