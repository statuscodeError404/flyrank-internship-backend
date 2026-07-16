const express = require('express');
const {
  getCourses,
  getCourse,
  addCourse,
  uppdateCourse,
  deleteCourse,
  getCoursesByBootcampId,
} = require('../controllers/courses');

const advancedResults = require('../Middleware/advancedResults');
const { protect, authorize } = require('../Middleware/auth');
const { prisma } = require('../config/db');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(
    advancedResults(prisma.course, { bootcamp: { select: { name: true, description: true } } }),
    getCourses
  );

router.route('/:bootcampId/courses').get(getCoursesByBootcampId);

router
  .route('/:bootcampId/courses')
  .post(protect, authorize('publisher', 'admin'), addCourse);

router
  .route('/:id')
  .get(getCourse)
  .put(protect, authorize('publisher', 'admin'), uppdateCourse)
  .delete(protect, authorize('publisher', 'admin'), deleteCourse);

module.exports = router;
