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




router
.route('/')         
.get(advancedResults(Bootcamp, 'courses'), getBootcamps)
.post(createBootcamp);


router
.route('/:id')
.get(getBootcamp)
.put(updateBootcamp)
.delete(deleteBootcamp);

router.route('/:id/photo').put(bootcampPhotoUpload);

router
.route('/get-by-city/:city')
.get(getBootcampByCity)

module.exports = router;
