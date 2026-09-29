const config = require('../config/env');
const ApiError = require('../utils/apiError');

/**
 * Global error-handling middleware.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path}: ${err.value}`;
    error = ApiError.badRequest(message);
  }

  // Handle Mongoose duplicate key errors (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `Duplicate value entered for ${field}. Please use another value.`;
    error = ApiError.conflict(message);
  }

  // Handle Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message
    }));
    const message = errors.length > 0 ? errors[0].message : 'Validation Error';
    error = ApiError.badRequest(message, errors);
  }

  // Handle malformed JSON body SyntaxError
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error = ApiError.badRequest('Malformed JSON in request body');
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized('Invalid authentication token');
  } else if (err.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Authentication token has expired');
  }

  const statusCode = error.statusCode || 500;
  const isProduction = config.env === 'production';

  const responsePayload = {
    success: false,
    message: error.message || 'Internal Server Error',
    errors: error.errors && error.errors.length > 0 ? error.errors : undefined
  };

  // Only expose stack traces in non-production environments
  if (!isProduction && error.stack) {
    responsePayload.stack = error.stack;
  }

  if (statusCode === 500 && config.env !== 'test') {
    console.error('[UNHANDLED ERROR]', err);
  }

  return res.status(statusCode).json(responsePayload);
};

module.exports = errorHandler;
