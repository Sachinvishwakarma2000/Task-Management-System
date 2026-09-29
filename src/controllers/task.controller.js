const taskService = require('../services/task.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Handle new task creation.
 * Route: POST /api/tasks
 */
const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.user._id, req.body);
  return ApiResponse.created(res, {
    message: 'Task created successfully',
    data: { task }
  });
});

/**
 * Handle listing of tasks for authenticated user with search, filter, and pagination.
 * Route: GET /api/tasks
 */
const getTasks = asyncHandler(async (req, res) => {
  const { tasks, pagination } = await taskService.getTasks(req.user._id, req.query);
  return ApiResponse.success(res, {
    message: 'Tasks retrieved successfully',
    data: { tasks },
    pagination
  });
});

/**
 * Handle retrieval of a single task by ID.
 * Route: GET /api/tasks/:id
 */
const getTaskById = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.params.id, req.user._id);
  return ApiResponse.success(res, {
    message: 'Task retrieved successfully',
    data: { task }
  });
});

/**
 * Handle updating an existing task.
 * Route: PUT /api/tasks/:id or PATCH /api/tasks/:id
 */
const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.params.id, req.user._id, req.body);
  return ApiResponse.success(res, {
    message: 'Task updated successfully',
    data: { task }
  });
});

/**
 * Handle deleting a task.
 * Route: DELETE /api/tasks/:id
 */
const deleteTask = asyncHandler(async (req, res) => {
  await taskService.deleteTask(req.params.id, req.user._id);
  return ApiResponse.success(res, {
    message: 'Task deleted successfully',
    data: null
  });
});

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask
};
