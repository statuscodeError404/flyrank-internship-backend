const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorRespoonce');
const User = require('../models/User');

// // Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    // Extract token from header or cookie
    if (
        req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } 

    else if(req.cookies.token) {
        token = req.cookies.token
    }
    
    // Make sure token exists
    if (!token) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log(decoded); // Remove in production or replace with proper logging

        // Find user and attach to request object
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return next(new ErrorResponse('User not found', 404));
        }

        next();
    } catch (error) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        // Ensure req.user exists and check the role
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new ErrorResponse(`User role ${req.user ? req.user.role : 'undefined'} is unauthorized to access this route`, 403));
        }
        next();
    };
};