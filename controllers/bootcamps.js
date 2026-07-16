const path = require('path');
const slugify = require('slugify').default || require('slugify');
const asyncHandler = require('../Middleware/async');
const ErrorResponse = require('../utils/errorRespoonce');
const { prisma } = require('../config/db');


// @desc   Get all bootcamps
// @route  GET /api/v1/bootcamps
// @access Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});


// @desc   Get single bootcamp
// @route  GET /api/v1/bootcamps/:id
// @access Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await prisma.bootcamp.findUnique({
    where: { id: req.params.id },
    include: { courses: true },
  });

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: bootcamp });
});


// @desc   Create new bootcamp
// @route  POST /api/v1/bootcamps
// @access Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const publishedBootcamp = await prisma.bootcamp.findFirst({
    where: { userId: req.user.id },
  });

  if (publishedBootcamp && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `The user with ID ${req.user.id} has already published a bootcamp`,
        400
      )
    );
  }

  const { user, _id, ...data } = req.body;

  data.userId = req.user.id;
  data.slug = slugify(data.name, { lower: true });

  const bootcamp = await prisma.bootcamp.create({ data });

  res.status(201).json({ success: true, data: bootcamp });
});


// @desc   Update bootcamp
// @route  PUT /api/v1/bootcamps/:id
// @access Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await prisma.bootcamp.findUnique({
    where: { id: req.params.id },
  });

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  if (bootcamp.userId !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this bootcamp`,
        401
      )
    );
  }

  const { user, userId, id, ...data } = req.body;

  if (data.name) {
    data.slug = slugify(data.name, { lower: true });
  }

  const updated = await prisma.bootcamp.update({
    where: { id: req.params.id },
    data,
  });

  res.status(200).json({ success: true, data: updated });
});


// @desc   Delete bootcamp
// @route  DELETE /api/v1/bootcamps/:id
// @access Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await prisma.bootcamp.findUnique({
    where: { id: req.params.id },
  });

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  if (bootcamp.userId !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this bootcamp`,
        401
      )
    );
  }

  // Cascade delete is handled by the DB (onDelete: Cascade on Course and Review)
  await prisma.bootcamp.delete({ where: { id: req.params.id } });

  res.status(200).json({ success: true, data: {} });
});


// @desc   Get bootcamps by city
// @route  GET /api/v1/bootcamps/get-by-city/:city
// @access Public
exports.getBootcampByCity = asyncHandler(async (req, res, next) => {
  const city = req.params.city;

  const bootcamps = await prisma.bootcamp.findMany({
    where: { city: { contains: city, mode: 'insensitive' } },
  });

  res.status(200).json({ success: true, count: bootcamps.length, data: bootcamps });
});


// @desc   Upload photo for bootcamp
// @route  PUT /api/v1/bootcamps/:id/photo
// @access Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await prisma.bootcamp.findUnique({
    where: { id: req.params.id },
  });

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  if (bootcamp.userId !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this bootcamp`,
        401
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const file = req.files.file;

  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse('Please upload an image file', 400));
  }

  const maxFileSize = parseInt(process.env.MAX_FILE_UPLOAD, 10);
  if (file.size > maxFileSize) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  file.name = `photo_${bootcamp.id}${path.extname(file.name)}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse('Problem with file upload', 500));
    }

    await prisma.bootcamp.update({
      where: { id: req.params.id },
      data: { photo: file.name },
    });

    res.status(200).json({ success: true, data: file.name });
  });
});
