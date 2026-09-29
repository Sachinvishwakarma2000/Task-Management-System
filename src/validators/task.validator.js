const Joi = require('joi');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const createTaskSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(150)
    .required()
    .messages({
      'string.base': 'Title must be a string',
      'string.empty': 'Title cannot be empty',
      'string.min': 'Title must have at least 1 character',
      'string.max': 'Title cannot exceed 150 characters',
      'any.required': 'Title is a required field'
    }),
  description: Joi.string()
    .trim()
    .max(2000)
    .optional()
    .allow('')
    .messages({
      'string.base': 'Description must be a string',
      'string.max': 'Description cannot exceed 2000 characters'
    }),
  priority: Joi.string()
    .trim()
    .lowercase()
    .valid('low', 'medium', 'high')
    .default('medium')
    .messages({
      'any.only': 'Priority must be one of: low, medium, high'
    }),
  status: Joi.string()
    .trim()
    .lowercase()
    .valid('pending', 'in-progress', 'completed')
    .default('pending')
    .messages({
      'any.only': 'Status must be one of: pending, in-progress, completed'
    }),
  dueDate: Joi.date()
    .iso()
    .optional()
    .allow(null)
    .messages({
      'date.format': 'Due date must be a valid ISO 8601 date string'
    })
});

const updateTaskSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(150)
    .optional()
    .messages({
      'string.base': 'Title must be a string',
      'string.empty': 'Title cannot be empty',
      'string.min': 'Title must have at least 1 character',
      'string.max': 'Title cannot exceed 150 characters'
    }),
  description: Joi.string()
    .trim()
    .max(2000)
    .optional()
    .allow('')
    .messages({
      'string.base': 'Description must be a string',
      'string.max': 'Description cannot exceed 2000 characters'
    }),
  priority: Joi.string()
    .trim()
    .lowercase()
    .valid('low', 'medium', 'high')
    .optional()
    .messages({
      'any.only': 'Priority must be one of: low, medium, high'
    }),
  status: Joi.string()
    .trim()
    .lowercase()
    .valid('pending', 'in-progress', 'completed')
    .optional()
    .messages({
      'any.only': 'Status must be one of: pending, in-progress, completed'
    }),
  dueDate: Joi.date()
    .iso()
    .optional()
    .allow(null)
    .messages({
      'date.format': 'Due date must be a valid ISO 8601 date string'
    })
})
  .min(1)
  .messages({
    'object.min': 'At least one field (title, description, priority, status, dueDate) must be provided for update'
  });

const queryTaskSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string()
    .trim()
    .lowercase()
    .valid('pending', 'in-progress', 'completed')
    .optional(),
  priority: Joi.string()
    .trim()
    .lowercase()
    .valid('low', 'medium', 'high')
    .optional(),
  search: Joi.string().trim().max(100).optional().allow(''),
  sortBy: Joi.string()
    .trim()
    .valid('createdAt', 'dueDate', 'priority', 'title', 'status')
    .default('createdAt'),
  order: Joi.string()
    .trim()
    .lowercase()
    .valid('asc', 'desc')
    .default('desc')
});

const taskIdParamSchema = Joi.object({
  id: Joi.string()
    .trim()
    .regex(objectIdPattern)
    .required()
    .messages({
      'string.pattern.base': 'Invalid task ID format. Must be a 24-character hexadecimal MongoDB ObjectId',
      'any.required': 'Task ID is required'
    })
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  queryTaskSchema,
  taskIdParamSchema
};
