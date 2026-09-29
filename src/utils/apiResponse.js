/**
 * Standardized API response builder for consistent client-facing responses.
 */
class ApiResponse {
  /**
   * Send a successful response.
   *
   * @param {import('express').Response} res - Express response object
   * @param {object} options
   * @param {number} [options.statusCode=200] - HTTP status code
   * @param {string} [options.message='Success'] - Human-readable success message
   * @param {any} [options.data=null] - Payload to return
   * @param {object} [options.pagination=null] - Optional pagination metadata
   */
  static success(res, { statusCode = 200, message = 'Success', data = null, pagination = null }) {
    const payload = {
      success: true,
      message,
      data
    };

    if (pagination) {
      payload.pagination = pagination;
    }

    return res.status(statusCode).json(payload);
  }

  /**
   * Helper for 201 Created responses.
   */
  static created(res, { message = 'Resource created successfully', data = null }) {
    return ApiResponse.success(res, { statusCode: 201, message, data });
  }
}

module.exports = ApiResponse;
