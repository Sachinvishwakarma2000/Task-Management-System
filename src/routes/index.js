const express = require('express');
const authRoutes = require('./auth.routes');
const taskRoutes = require('./task.routes');

const router = express.Router();

// Root API status endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Task Management System API is operating normally',
    version: '1.0.0',
    documentation: '/README.md',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/me'
      },
      tasks: {
        create: 'POST /api/tasks',
        list: 'GET /api/tasks (supports ?page, ?limit, ?status, ?priority, ?search, ?sortBy, ?order)',
        getById: 'GET /api/tasks/:id',
        update: 'PUT/PATCH /api/tasks/:id',
        delete: 'DELETE /api/tasks/:id'
      }
    }
  });
});

// Mount modular sub-routers
router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);

module.exports = router;
