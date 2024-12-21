const { query } = require("express");
const asyncHandler = require("../Middleware/async");
const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamps");
const ErrorResponse = require("../utils/errorRespoonce");



// @desc   Get Courses
// @route  GET /api/v1/courses
// @route  GET /api/v1/bootcamp/:bootcampId/courses
// @access Public
exports.getCourses = asyncHandler(async (req, res, next) => {
    console.log('Params bootcampId:', req.params.bootcampId);


    if (req.params.bootcampId || req.query.bootcampId) {
        const bootcampId = req.params.bootcampId || req.query.bootcampId;
        const courses = await Course.find({ bootcamp: bootcampId });

        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        })
    } else {
       res.status(200).json(res.advancedResults);
    }

});


// @desc   Get single courses
// @route  GET /api/v1/courses/:id
// @route  GET /api/v1/bootcamp/:bootcampId/courses
// @access Public
exports.getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if(!course) {
        return next(new ErrorResponse(`No course with id of ${req.params.id}`), 404);
    }

    res.status(200).json({
        success: true,
        data: course
    });
});


// @desc   Get Course with BootcampId
// @route  GET /api/v1/courses/:bootcampId/courses
// @access Public
exports.getCoursesByBootcampId = asyncHandler(async (req, res, next) => {
    const { bootcampId } = req.params;
    
    // Get courses associated with BootcampId
    const courses = await Course.find({ bootcamp: bootcampId });

    // Return 404 if course is not found with bootcampId
    if (courses.length === 0) {
        res.status(200).json({
          success: false,
          message: `No Course find with bootcamps id of ${bootcampId}`
      });
    } else {
      res.status(200).json({
        success: true,
        count: courses.length,
        data: courses
    });
  }
});


// @desc   Add course
// @route  POST /api/v1/bootcamps/:bootcampId/courses
// @access Private
exports.addCourse = asyncHandler(async (req, res, next) => {
    // Attach bootcamp ID to request body
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    // Look for the bootcamp by ID
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    // If bootcamp doesn't exist, return an error
    if (!bootcamp) {
        return next(new ErrorResponse(`No bootcamp with id of ${req.params.bootcampId}`, 404));
    }

    // Make sure user is bootcamp owner
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
          new ErrorResponse(`User ${req.user.id} is not authorized to add a course to this bootcamp ${bootcamp._id} `, 401)
        );
    
      };

    // Create the new course
    const course = await Course.create(req.body);

    // Respond with success and the created course
    res.status(200).json({
        success: true,
        data: course
    });
});


// @desc   Update course
// @route  PUT /api/v1/courses/:id
// @access Private
exports.uppdateCourse = asyncHandler(async (req, res, next) => {

    let course = await Course.findById(req.params.id);

    // If bootcamp doesn't exist, return an error
    if (!course) {
        return next(new ErrorResponse(`No course with id of ${req.params.course}`, 404));
    }

    // Make sure user is course owner
    if(course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
          new ErrorResponse(`User ${req.user.id} is not authorized to uprate course ${course._id} `, 401)
        );
    
      };

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    // Respond with success and the created course
    res.status(200).json({
        success: true,
        data: course
    });
});


// @desc   Delete course
// @route  DELETE /api/v1/courses/:id
// @access Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id);

    // If course doesn't exist, return an error
    if (!course) {
        return next(new ErrorResponse(`No course with id of ${req.params.id}`, 404));
    }

     // Make sure user is course owner
     if(course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
          new ErrorResponse(`User ${req.user.id} is not authorized to delete course ${course._id} `, 401)
        );
    
      };

    await Course.deleteOne({ _id: req.params.id });

    // Respond with success and the deleted course
    res.status(200).json({
        success: true,
        data: {}
    });
});



