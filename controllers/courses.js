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


    let query;

    if (req.params.bootcampId || req.query.bootcampId) {
        const bootcampId = req.params.bootcampId || req.query.bootcampId;
        query = Course.find({ bootcamp: bootcampId });
    } else {
        query = Course.find().populate({
            path: 'bootcamp',
            select: 'name description'
        });
    }

    const courses = await query;

    res.status(200).json({
        success: true,
        count: courses.length,
        data: courses
    });
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

// @desc   Add course
// @route  GET /api/v1/bootcamps/:bootcampId/courses
// @route  GET /api/v1/bootcamp/:bootcampId/courses
// @access Private


exports.addCourse = asyncHandler(async (req, res, next) => {
    // Attach bootcamp ID to request body
    req.body.bootcamp = req.params.bootcampId;

    // Look for the bootcamp by ID
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    // If bootcamp doesn't exist, return an error
    if (!bootcamp) {
        return next(new ErrorResponse(`No bootcamp with id of ${req.params.bootcampId}`, 404));
    }

    // Create the new course
    const course = await Course.create(req.body);

    // Respond with success and the created course
    res.status(200).json({
        success: true,
        data: course
    });
});


