const express = require('express');
const {
  getReviews,
  getReviewsByBootcampId,
  getReview,
  addReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviews');

const advancedResults = require('../Middleware/advancedResults');
const { protect, authorize } = require('../Middleware/auth');
const { prisma } = require('../config/db');

const router = express.Router({ mergeParams: true });

router.route('/:bootcampId/reviews').get(getReviewsByBootcampId);
router.route('/:bootcampsid/reviews').post(protect, authorize('user', 'admin'), addReview);

router
  .route('/')
  .get(
    advancedResults(prisma.review, { bootcamp: { select: { name: true, description: true } } }),
    getReviews
  );

router
  .route('/:id')
  .get(getReview)
  .put(protect, authorize('user', 'admin'), updateReview)
  .delete(protect, authorize('user', 'admin'), deleteReview);

module.exports = router;
