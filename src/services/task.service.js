const Task = require('../models/task.model');
const ApiError = require('../utils/apiError');

/**
 * Create a new task belonging to the authenticated user.
 *
 * @param {string} userId - ID of authenticated user
 * @param {object} taskData - Task payload
 * @returns {Promise<object>} Created task document
 */
const createTask = async (userId, taskData) => {
  const { title, description, priority, status, dueDate } = taskData;

  const task = await Task.create({
    title,
    description: description || '',
    priority: priority || 'medium',
    status: status || 'pending',
    dueDate: dueDate ? new Date(dueDate) : null,
    user: userId // Strictly assigned from authenticated JWT identity
  });

  return task.toJSON();
};

/**
 * Retrieve tasks belonging to the authenticated user with filtering, search, and pagination.
 *
 * @param {string} userId - ID of authenticated user
 * @param {object} queryOptions
 * @param {number} [queryOptions.page=1]
 * @param {number} [queryOptions.limit=10]
 * @param {string} [queryOptions.status]
 * @param {string} [queryOptions.priority]
 * @param {string} [queryOptions.search]
 * @param {string} [queryOptions.sortBy='createdAt']
 * @param {'asc'|'desc'} [queryOptions.order='desc']
 * @returns {Promise<{ tasks: Array<object>, pagination: object }>}
 */
const getTasks = async (userId, queryOptions = {}) => {
  const page = Math.max(1, parseInt(queryOptions.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(queryOptions.limit, 10) || 10));
  const skip = (page - 1) * limit;

  // Build filter query scoped to the authenticated user
  const filter = { user: userId };

  if (queryOptions.status) {
    filter.status = queryOptions.status;
  }

  if (queryOptions.priority) {
    filter.priority = queryOptions.priority;
  }

  if (queryOptions.search && queryOptions.search.trim()) {
    const searchRegex = new RegExp(queryOptions.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [
      { title: { $regex: searchRegex } },
      { description: { $regex: searchRegex } }
    ];
  }

  // Determine sort options
  const sortBy = queryOptions.sortBy || 'createdAt';
  const order = queryOptions.order === 'asc' ? 1 : -1;
  const sort = { [sortBy]: order };

  const [total, tasks] = await Promise.all([
    Task.countDocuments(filter),
    Task.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    tasks: tasks.map((t) => t.toJSON()),
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};

/**
 * Retrieve a single task by ID, strictly verifying ownership.
 *
 * @param {string} taskId
 * @param {string} userId
 * @returns {Promise<object>}
 */
const getTaskById = async (taskId, userId) => {
  const task = await Task.findOne({ _id: taskId, user: userId });
  if (!task) {
    throw ApiError.notFound('Task not found');
  }

  return task.toJSON();
};

/**
 * Update allowed fields of an existing task belonging to the authenticated user.
 *
 * @param {string} taskId
 * @param {string} userId
 * @param {object} updateData
 * @returns {Promise<object>}
 */
const updateTask = async (taskId, userId, updateData) => {
  const task = await Task.findOne({ _id: taskId, user: userId });
  if (!task) {
    throw ApiError.notFound('Task not found');
  }

  const allowedFields = ['title', 'description', 'priority', 'status', 'dueDate'];
  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      if (field === 'dueDate') {
        task.dueDate = updateData.dueDate ? new Date(updateData.dueDate) : null;
      } else {
        task[field] = updateData[field];
      }
    }
  });

  await task.save();
  return task.toJSON();
};

/**
 * Delete a task belonging to the authenticated user.
 *
 * @param {string} taskId
 * @param {string} userId
 * @returns {Promise<object>}
 */
const deleteTask = async (taskId, userId) => {
  const task = await Task.findOneAndDelete({ _id: taskId, user: userId });
  if (!task) {
    throw ApiError.notFound('Task not found');
  }

  return task.toJSON();
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask
};
