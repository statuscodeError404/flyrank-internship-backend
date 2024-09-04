const { query } = require("express");
const asyncHandler = require("../Middleware/async");
const Course = require("../models/Course");
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