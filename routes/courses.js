const express = require("express");
const advancedResults = require('../Middleware/advancedResults');
const Course = require("../models/Course");


const { getCourses, getCourse, addCourse, uppdateCourse, deleteCourse, getCoursesByBootcampId  } = require("../controllers/courses");

const router = express.Router({ margeParams: true });

const { protect, authorize } = require('../Middleware/auth');

router.route('/').get(advancedResults(Course, {
    path: 'bootcamp',
    select: 'name description'
}),  getCourses);

// Route to get courses by bootcamp ID
router.route('/:bootcampId/courses').get(getCoursesByBootcampId);

router
.route('/:id')
.get(getCourse)
.put(protect, authorize('publisher', 'admin'), uppdateCourse)
.delete(protect, authorize('publisher', 'admin'), deleteCourse);

router
.route('/:bootcampId/courses')
.post(protect, authorize('publisher', 'admin'), addCourse);



module.exports = router;