const authService = require('../services/auth.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');



/**
 * Handle user registration.
 * Route: POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  return ApiResponse.created(res, {
    message: 'User registered successfully',
    data: result
  });
});

/**
 * Handle user login.
 * Route: POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);
  return ApiResponse.success(res, {
    message: 'Login successful',
    data: result
  });
});

/**
 * Get current authenticated user's profile.
 * Route: GET /api/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  // req.user is attached by the authenticate middleware
  return ApiResponse.success(res, {
    message: 'Profile retrieved successfully',
    data: {
      user: req.user.toJSON()
    }
  });
});

module.exports = {
  register,
  login,
  getMe
};
