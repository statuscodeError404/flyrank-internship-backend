const asyncHandler = require('../Middleware/async');
const ErrorResponse = require('../utils/errorRespoonce');
const { prisma } = require('../config/db');


const updateAverageRating = async (bootcampId) => {
  const result = await prisma.review.aggregate({
    where: { bootcampId },
    _avg: { rating: true },
  });
  await prisma.bootcamp.update({
    where: { id: bootcampId },
    data: { averageRating: result._avg.rating },
  });
};


// @desc   Get all reviews (or reviews for a bootcamp)
// @route  GET /api/v1/reviews
// @route  GET /api/v1/bootcamps/:bootcampId/reviews
// @access Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await prisma.review.findMany({
      where: { bootcampId: req.params.bootcampId },
    });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});


// @desc   Get reviews by bootcamp ID
// @route  GET /api/v1/reviews/:bootcampId/reviews
// @access Public
exports.getReviewsByBootcampId = asyncHandler(async (req, res, next) => {
  const { bootcampId } = req.params;

  const reviews = await prisma.review.findMany({ where: { bootcampId } });

  if (reviews.length === 0) {
    return res.status(200).json({
      success: false,
      message: `No reviews for bootcamp ${bootcampId}`,
    });
  }

  res.status(200).json({ success: true, count: reviews.length, data: reviews });
});


// @desc   Get single review
// @route  GET /api/v1/reviews/:id
// @access Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await prisma.review.findUnique({
    where: { id: req.params.id },
    include: {
      bootcamp: { select: { name: true, description: true } },
    },
  });

  if (!review) {
    return next(
      new ErrorResponse(`No review found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: review });
});


// @desc   Add review
// @route  POST /api/v1/bootcamps/:bootcampsid/reviews
// @access Private
exports.addReview = asyncHandler(async (req, res, next) => {
  const bootcamp = await prisma.bootcamp.findUnique({
    where: { id: req.params.bootcampsid },
  });

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `No bootcamp with the id of ${req.params.bootcampsid}`,
        404
      )
    );
  }

  const { _id, user, bootcamp: _b, ...data } = req.body;

  data.bootcampId = req.params.bootcampsid;
  data.userId = req.user.id;

  const review = await prisma.review.create({ data });

  await updateAverageRating(req.params.bootcampsid);

  res.status(201).json({ success: true, data: review });
});


// @desc   Update review
// @route  PUT /api/v1/reviews/:id
// @access Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  const review = await prisma.review.findUnique({ where: { id: req.params.id } });

  if (!review) {
    return next(
      new ErrorResponse(`No review found with id of ${req.params.id}`, 404)
    );
  }

  if (review.userId !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update review', 401));
  }

  const { _id, userId, bootcampId, ...data } = req.body;

  const updated = await prisma.review.update({
    where: { id: req.params.id },
    data,
  });

  await updateAverageRating(review.bootcampId);

  res.status(200).json({ success: true, data: updated });
});


// @desc   Delete review
// @route  DELETE /api/v1/reviews/:id
// @access Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await prisma.review.findUnique({ where: { id: req.params.id } });

  if (!review) {
    return next(
      new ErrorResponse(`No review found with id of ${req.params.id}`, 404)
    );
  }

  if (review.userId !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete review', 401));
  }

  await prisma.review.delete({ where: { id: req.params.id } });

  await updateAverageRating(review.bootcampId);

  res.status(200).json({ success: true, data: {} });
});
