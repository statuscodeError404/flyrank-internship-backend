const asyncHandler = require('../Middleware/async');
const ErrorResponse = require('../utils/errorRespoonce');
const { prisma } = require('../config/db');


const updateAverageCost = async (bootcampId) => {
  const result = await prisma.course.aggregate({
    where: { bootcampId },
    _avg: { tuition: true },
  });
  const averageCost = result._avg.tuition
    ? Math.ceil(result._avg.tuition / 10) * 10
    : null;
  await prisma.bootcamp.update({
    where: { id: bootcampId },
    data: { averageCost },
  });
};


// @desc   Get all courses (or courses for a bootcamp)
// @route  GET /api/v1/courses
// @route  GET /api/v1/bootcamps/:bootcampId/courses
// @access Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId || req.query.bootcampId) {
    const bootcampId = req.params.bootcampId || req.query.bootcampId;
    const courses = await prisma.course.findMany({ where: { bootcampId } });

    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});


// @desc   Get single course
// @route  GET /api/v1/courses/:id
// @access Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await prisma.course.findUnique({
    where: { id: req.params.id },
    include: {
      bootcamp: { select: { name: true, description: true } },
    },
  });

  if (!course) {
    return next(
      new ErrorResponse(`No course with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: course });
});


// @desc   Get courses by bootcamp ID
// @route  GET /api/v1/courses/:bootcampId/courses
// @access Public
exports.getCoursesByBootcampId = asyncHandler(async (req, res, next) => {
  const { bootcampId } = req.params;

  const courses = await prisma.course.findMany({ where: { bootcampId } });

  if (courses.length === 0) {
    return res.status(200).json({
      success: false,
      message: `No courses found for bootcamp id of ${bootcampId}`,
    });
  }

  res.status(200).json({ success: true, count: courses.length, data: courses });
});


// @desc   Add course
// @route  POST /api/v1/bootcamps/:bootcampId/courses
// @access Private
exports.addCourse = asyncHandler(async (req, res, next) => {
  const bootcamp = await prisma.bootcamp.findUnique({
    where: { id: req.params.bootcampId },
  });

  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp with id of ${req.params.bootcampId}`, 404)
    );
  }

  if (bootcamp.userId !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to add a course to bootcamp ${bootcamp.id}`,
        401
      )
    );
  }

  const { _id, user, bootcamp: _b, ...data } = req.body;

  data.bootcampId = req.params.bootcampId;
  data.userId = req.user.id;

  const course = await prisma.course.create({ data });

  await updateAverageCost(req.params.bootcampId);

  res.status(200).json({ success: true, data: course });
});


// @desc   Update course
// @route  PUT /api/v1/courses/:id
// @access Private
exports.uppdateCourse = asyncHandler(async (req, res, next) => {
  const course = await prisma.course.findUnique({ where: { id: req.params.id } });

  if (!course) {
    return next(
      new ErrorResponse(`No course with id of ${req.params.id}`, 404)
    );
  }

  if (course.userId !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update course ${course.id}`,
        401
      )
    );
  }

  const { _id, userId, bootcampId, ...data } = req.body;

  const updated = await prisma.course.update({
    where: { id: req.params.id },
    data,
  });

  await updateAverageCost(course.bootcampId);

  res.status(200).json({ success: true, data: updated });
});


// @desc   Delete course
// @route  DELETE /api/v1/courses/:id
// @access Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await prisma.course.findUnique({ where: { id: req.params.id } });

  if (!course) {
    return next(
      new ErrorResponse(`No course with id of ${req.params.id}`, 404)
    );
  }

  if (course.userId !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete course ${course.id}`,
        401
      )
    );
  }

  await prisma.course.delete({ where: { id: req.params.id } });

  await updateAverageCost(course.bootcampId);

  res.status(200).json({ success: true, data: {} });
});
