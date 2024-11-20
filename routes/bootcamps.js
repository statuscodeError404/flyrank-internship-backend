
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

const { protect } = require('../Middleware/auth');




router
.route('/')         
.get(advancedResults(Bootcamp, 'courses'), getBootcamps)
.post(protect, createBootcamp);


router
.route('/:id')
.get(getBootcamp)
.put(protect, updateBootcamp)
.delete(protect, deleteBootcamp);

router.route('/:id/photo').put(protect, bootcampPhotoUpload);

router
.route('/get-by-city/:city')
.get(getBootcampByCity)

module.exports = router;
