const { query } = require("express");
const asyncHandler = require("../Middleware/async");
const Bootcamp = require("../models/Bootcamps");
const ErrorResponse = require("../utils/errorRespoonce");
const Course = require('../models/Course');
const fileUpload = require('express-fileupload');
const path = require('path');


// @desc   Get all bootcamps
// @route  GET /api/v1/bootcamps
// @access Public


exports.getBootcamps = asyncHandler(async (req, res, next) => {
  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude from the query
  const removeFields = ["select", "sort", "page", "limit"];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators like $gt, $gte, etc.
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

  // Find resource
  let query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');

  // Select specific fields if requested
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;

  // Adjust query with pagination
  query = query.skip(startIndex).limit(limit);

  // Get the total count of documents
  const total = await Bootcamp.countDocuments(JSON.parse(queryStr));

  // Execute the query
  const bootcamps = await query;

  // Pagination result
  const pagination = {};

  if (startIndex + limit < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  // Send the response
  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
    pagination,
  });
});

// @desc   Get single bootcamps
// @route  GET /api/v1/bootcamps/:id
// @access Public

exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    // Return 404 if the bootcamp is not found
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  // Respond with the bootcamp data if found
  res.status(200).json({ success: true, data: bootcamp });
});

// @desc   Create new bootcamp
// @route  POST /api/v1/bootcamps
// @access Private

exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

// @desc   Update bootcamp
// @route  PUT /api/v1/bootcamps/:id
// @access Private

exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: bootcamp });
});

// @desc   Delete bootcamp
// @route  DELETE /api/v1/bootcamps/:id
// @access Private

exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  // Manually delete associated courses before deleting the bootcamp
  await Course.deleteMany({ bootcamp: bootcamp._id });

  // Delete the bootcamp
  await bootcamp.deleteOne();

  res.status(200).json({ success: true, data: {} });
});


// @desc   Get bootcamp by city
// @route /api/v1/bootcamps/:city
// @access Private

exports.getBootcampByCity = asyncHandler(async (req, res, next) => {
  const city = req.params.city;

  const bootcamp = await Bootcamp.find({ address: city });

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with city of ${city}`, 404)
    );
  }

  res.status(200).json({ success: true, data: bootcamp });
});

// @desc   Upload photo for bootcamp
// @route  PUT /api/v1/bootcamps/:id/photo
// @access Private


exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  if (!req.files) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const file = req.files.file;

  // Make sure the file is an image
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse('Please upload an image file', 400));
  }

  // Check filesize
  const maxFileSize = parseInt(process.env.MAX_FILE_UPLOAD, 10);
  if (file.size > maxFileSize) {
    return next(
      new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400)
    );
  }

  // Create custom filename
  file.name = `photo_${bootcamp._id}${path.extname(file.name)}`;

  // Move the file
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse('Problem with file upload', 500));
    }

    // Update bootcamp photo field in DB
    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
