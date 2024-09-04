const { query } = require("express");
const asyncHandler = require("../Middleware/async");
const Bootcamp = require("../models/Bootcamps");
const ErrorResponse = require("../utils/errorRespoonce");


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
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: {} });
});

// @desc   Get bootcamp by city
// @route  DELETE /api/v1/bootcamps/:city
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
