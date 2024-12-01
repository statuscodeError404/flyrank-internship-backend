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
  res.status(200).json(res.advancedResults);
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

// exports.createBootcamp = asyncHandler(async (req, res, next) => {
//   // Add user to req.body
//   req.body.user = req.user.id;

//   // Check for published bootcamp
//   const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

//   // If the user is not an admin, they can only add one bootcamp
//   if(publishedBootcamp && req.user.role !== 'admin') {
//   const bootcamp = await Bootcamp.create(req.body) 
//     return next(new ErrorResponse(`The user with ID ${req.user.id} has allredy published a bootcamp`, 400));
//   }


//   res.status(201).json({
//     success: true,
//     data: Bootcamp,
//   });
// });

exports.createBootcamp = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  // Check for published bootcamp
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  // If the user is not an admin, they can only add one bootcamp
  if (publishedBootcamp && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `The user with ID ${req.user.id} has already published a bootcamp`,
        400
      )
    );
  }

  // Create the bootcamp
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
