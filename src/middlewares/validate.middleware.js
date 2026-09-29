const ApiError = require('../utils/apiError');

/**
 * Higher-order middleware function to validate Express request parameters, body, or query with Joi.
 *
 * @param {import('joi').ObjectSchema} schema - Joi validation schema
 * @param {'body'|'query'|'params'} [target='body'] - Request property to validate
 * @returns {import('express').RequestHandler}
 */
const validate = (schema, target = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[target], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const formattedErrors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, '')
      }));

      const primaryMessage = formattedErrors.length > 0 ? formattedErrors[0].message : 'Validation Error';
      return next(new ApiError(400, primaryMessage, formattedErrors));
    }

    // Replace request target with validated and sanitized data
    req[target] = value;
    next();
  };
};

module.exports = validate;
