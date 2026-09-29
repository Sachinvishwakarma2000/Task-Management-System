const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/user.model');
const ApiError = require('../utils/apiError');

/**
 * Generate a signed JWT token for a given user.
 *
 * @param {import('../models/user.model')} user
 * @returns {string}
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email
    },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpiresIn
    }
  );
};

/**
 * Register a new user with hashed password.
 *
 * @param {object} userData
 * @param {string} userData.name
 * @param {string} userData.email
 * @param {string} userData.password
 * @returns {Promise<{ user: object, token: string }>}
 */
const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw ApiError.conflict('An account with this email address already exists');
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password
  });

  const token = generateToken(user);

  return {
    user: user.toJSON(),
    token
  };
};

/**
 * Authenticate a user by verifying email and password.
 *
 * @param {object} credentials
 * @param {string} credentials.email
 * @param {string} credentials.password
 * @returns {Promise<{ user: object, token: string }>}
 */
const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = generateToken(user);

  return {
    user: user.toJSON(),
    token
  };
};

/**
 * Fetch profile information for an authenticated user.
 *
 * @param {string} userId
 * @returns {Promise<object>}
 */
const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return user.toJSON();
};

module.exports = {
  generateToken,
  registerUser,
  loginUser,
  getUserProfile
};
