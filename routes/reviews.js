const express = require('express');
const {
    getReviews
} = require('../controllers/reviews');

const Review = require('../models/Review');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../Middleware/advancedResults');
const { protect, authorize } = require('../Middleware/auth');

router
.route('/')
.get(advancedResults(Review, {
    path: 'bootcamp',
    select: 'name description'
}), getReviews);


module.exports = router;



