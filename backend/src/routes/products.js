const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getRetailerAvailableProducts,
  getNearbyProducts
} = require('../controllers/productController');

const {
  getProductReviews,
  createReview,
  canReviewProduct
} = require('../controllers/reviewController');

const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Product routes
router.get('/', getProducts);
router.get('/nearby', getNearbyProducts);
router.get('/retailer/available', protect, authorize('retailer'), getRetailerAvailableProducts);
router.get('/:id', getProduct);
router.post('/', protect, authorize('retailer', 'wholesaler'), createProduct);
router.put('/:id', protect, authorize('retailer', 'wholesaler'), updateProduct);
router.delete('/:id', protect, authorize('retailer', 'wholesaler'), deleteProduct);

// Review routes (nested under products)
router.get('/:productId/reviews', getProductReviews);
router.post('/:productId/reviews', protect, upload.array('images', 5), createReview);
router.get('/:productId/can-review', protect, canReviewProduct);

module.exports = router;