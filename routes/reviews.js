const express = require('express');
const {
    getReviews,
    getReviewsByBootcampId
} = require('../controllers/reviews');

const Review = require('../models/Review');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../Middleware/advancedResults');
const { protect, authorize } = require('../Middleware/auth');

// Route to get courses by bootcamp ID
router.route('/:bootcampId/reviews').get(getReviewsByBootcampId);

router
.route('/')
.get(advancedResults(Review, {
    path: 'bootcamp',
    select: 'name description'
}), getReviews);


module.exports = router;



