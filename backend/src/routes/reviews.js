const express = require('express');
const router = express.Router();
const {
  updateReview,
  deleteReview,
  markHelpful,
  getMyReviews,
  addSellerResponse
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload'); // ✅ ADD THIS LINE

// Protected routes
router.get('/my-reviews', protect, getMyReviews);
router.put('/:id', protect, upload.array('images', 5), updateReview); // ✅ MODIFIED THIS LINE
router.delete('/:id', protect, deleteReview);
router.post('/:id/helpful', protect, markHelpful);
router.post('/:id/seller-response', protect, authorize('retailer', 'wholesaler'), addSellerResponse);

module.exports = router;