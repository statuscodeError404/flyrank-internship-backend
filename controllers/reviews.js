const asyncHandler = require("../Middleware/async");
const Review = require("../models/Review");
const ErrorResponse = require("../utils/errorRespoonce");
const Bootcamp = require('../models/Bootcamps');


// @desc   Get Reviews
// @route  GET /api/v1/reviews
// @route  GET /api/v1/bootcamp/:bootcampId/reviews
// @access Public
exports.getReviews = asyncHandler(async (req, res, next) => {
    if (req.params.bootcampId) {
        const reviews = await Review.find({ bootcamp: req.params.bootcampId });
    
        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } else {
        res.status(200).json(res.advancedResults);
    }

});


// @desc   Get Reviews with BootcampId
// @route  GET /api/v1/reviews/:bootcampId/reviews
// @access Public
exports.getReviewsByBootcampId = asyncHandler(async (req, res, next) => {
    const { bootcampId } = req.params;
    
    // Get Reviews associated with BootcampId
    const reviews = await Review.find({ bootcamp: bootcampId });

    // Return 404 if reviews are not found with bootcampId
    if (reviews.length === 0) {
        res.status(200).json({
          success: false,
          message: `No reviews for this bootcamp ${bootcampId}`
      });
    } else {
      res.status(200).json({
        success: true,
        count: reviews.length,
        data: reviews
    });
  }
});


// @desc   Get single Review
// @route  GET /api/v1/reviews:id
// @access Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({ 
    path: 'bootcamp',
    selcet: 'name description'
  });

  if(!review) {
    return next(new ErrorResponse(`No review found with id of ${req.params.id}`,404));
  }

  res.status(200).json({ success: true, data: review});

});


// @desc   Add reviews
// @route  POST /api/v1/bootcamps/:bootcampsid/reviews
// @access Private
exports.addReview = asyncHandler(async (req, res, next) => {
  
      req.body.bootcamp = req.params.bootcampsid;
      req.body.user = req.user.id;

      const bootcamp = await Bootcamp.findById(req.params.bootcampsid);

      if(!bootcamp) {
        return next(new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`, 404));
      }

      const review = await Review.create(req.body);

      res.status(201).json({
        success: true,
        data: review
      });

});


   




