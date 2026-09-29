const express = require('express');
const taskController = require('../controllers/task.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
  createTaskSchema,
  updateTaskSchema,
  queryTaskSchema,
  taskIdParamSchema
} = require('../validators/task.validator');

const router = express.Router();

// Enforce authentication for all task routes
router.use(authenticate);

/**
 * @route   POST /api/tasks
 * @desc    Create a new task for the authenticated user
 * @access  Private
 */
router.post(
  '/',
  validate(createTaskSchema, 'body'),
  taskController.createTask
);

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks belonging to authenticated user (pagination, filter, search)
 * @access  Private
 */
router.get(
  '/',
  validate(queryTaskSchema, 'query'),
  taskController.getTasks
);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get single task by ID (only if owned by authenticated user)
 * @access  Private
 */
router.get(
  '/:id',
  validate(taskIdParamSchema, 'params'),
  taskController.getTaskById
);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Full update on task
 * @access  Private
 */
router.put(
  '/:id',
  validate(taskIdParamSchema, 'params'),
  validate(updateTaskSchema, 'body'),
  taskController.updateTask
);

/**
 * @route   PATCH /api/tasks/:id
 * @desc    Partial update on task
 * @access  Private
 */
router.patch(
  '/:id',
  validate(taskIdParamSchema, 'params'),
  validate(updateTaskSchema, 'body'),
  taskController.updateTask
);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete task (only if owned by authenticated user)
 * @access  Private
 */
router.delete(
  '/:id',
  validate(taskIdParamSchema, 'params'),
  taskController.deleteTask
);

module.exports = router;
