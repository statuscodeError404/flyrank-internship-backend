const express = require('express');
const {
    getReviews,
    getReviewsByBootcampId,
    getReview,
    addReview,
    updateReview,
    deleteReview
} = require('../controllers/reviews');

const Review = require('../models/Review');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../Middleware/advancedResults');
const { protect, authorize } = require('../Middleware/auth');

// Route to get courses by bootcamp ID
router.route('/:bootcampId/reviews').get(getReviewsByBootcampId);

// Route to get reviews by bootcamp ID
router.route('/:bootcampsid/reviews').post(protect, authorize('user', 'admin'), addReview);


router
.route('/')
.get(advancedResults(Review, {
    path: 'bootcamp',
    select: 'name description'
}), getReviews);

router
  .route('/:id')
  .get(getReview)
  .put(protect, authorize('user', 'admin'), updateReview)
  .delete(protect, authorize('user', 'admin'), deleteReview);


module.exports = router;



