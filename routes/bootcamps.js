
const express = require("express");
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampByCity,
  bootcampPhotoUpload
} = require("../controllers/bootcamps");
const router = express.Router();

const Bootcamp = require("../models/Bootcamps");

const advancedResults = require('../Middleware/advancedResults');

const { protect, authorize } = require('../Middleware/auth');


router
.route('/')         
.get(advancedResults(Bootcamp, 'courses'), getBootcamps)
.post(protect, authorize('publisher', 'admin'), createBootcamp);


router
.route('/:id')
.get(getBootcamp)
.put(protect, authorize('publisher', 'admin'), updateBootcamp)
.delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

router.route('/:id/photo').put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);

router
.route('/get-by-city/:city')
.get(getBootcampByCity)

module.exports = router;
