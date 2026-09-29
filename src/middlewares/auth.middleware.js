const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/user.model');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Authentication middleware that verifies JWT and attaches user to request.
 */
const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(
      ApiError.unauthorized('Authentication token is required. Please provide header: Authorization: Bearer <token>')
    );
  }

  const token = authHeader.split(' ')[1];

  if (!token || token.trim() === '') {
    return next(ApiError.unauthorized('Authentication token is empty or malformed'));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, config.jwtSecret);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Token has expired. Please log in again'));
    }
    return next(ApiError.unauthorized('Invalid or corrupted authentication token'));
  }

  if (!decoded || !decoded.id) {
    return next(ApiError.unauthorized('Invalid token payload'));
  }

  // Verify that the user still exists in the database
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(ApiError.unauthorized('The user belonging to this token no longer exists'));
  }

  // Attach authenticated user to request object
  req.user = user;
  next();
});

module.exports = {
  authenticate
};
