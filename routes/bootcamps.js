const express = require('express');
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampByCity,
  bootcampPhotoUpload,
} = require('../controllers/bootcamps');
const { summarizeBootcamp } = require('../controllers/summarize');

const advancedResults = require('../Middleware/advancedResults');
const { protect, authorize } = require('../Middleware/auth');
const { prisma } = require('../config/db');

const router = express.Router();

router
  .route('/')
  .get(advancedResults(prisma.bootcamp, { courses: true }), getBootcamps)
  .post(protect, authorize('publisher', 'admin'), createBootcamp);

router.route('/get-by-city/:city').get(getBootcampByCity);

router
  .route('/:id')
  .get(getBootcamp)
  .put(protect, authorize('publisher', 'admin'), updateBootcamp)
  .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

router
  .route('/:id/photo')
  .put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);

router.route('/:id/summarize').post(summarizeBootcamp);

module.exports = router;
