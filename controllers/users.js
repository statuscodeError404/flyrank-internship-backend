const bcrypt = require('bcryptjs');
const ErrorResponse = require('../utils/errorRespoonce');
const asyncHandler = require('../Middleware/async');
const { prisma } = require('../config/db');


// @desc   Get all users
// @route  GET /api/v1/users
// @access Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});


// @desc   Get single user
// @route  GET /api/v1/users/:id
// @access Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({ success: true, data: user });
});


// @desc   Create user
// @route  POST /api/v1/users
// @access Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role },
  });

  res.status(201).json({ success: true, data: user });
});


// @desc   Update user
// @route  PUT /api/v1/users/:id
// @access Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const { password, ...data } = req.body;

  if (password) {
    const salt = await bcrypt.genSalt(10);
    data.password = await bcrypt.hash(password, salt);
  }

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data,
  });

  res.status(200).json({ success: true, data: user });
});


// @desc   Delete user
// @route  DELETE /api/v1/users/:id
// @access Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  await prisma.user.delete({ where: { id: req.params.id } });

  res.status(200).json({ success: true, data: {} });
});
