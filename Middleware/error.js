const ErrorResponse = require('../utils/errorRespoonce');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.log(err);

  // Prisma: Record not found
  if (err.code === 'P2025') {
    error = new ErrorResponse('Resource not found', 404);
  }

  // Prisma: Unique constraint violation
  if (err.code === 'P2002') {
    error = new ErrorResponse('Duplicate field value entered', 400);
  }

  // Prisma: Foreign key constraint violation
  if (err.code === 'P2003') {
    error = new ErrorResponse('Related resource not found', 404);
  }

  // Invalid UUID format
  if (err.message && err.message.includes('invalid input syntax for type uuid')) {
    error = new ErrorResponse('Resource not found', 404);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
  });
};

module.exports = errorHandler;
