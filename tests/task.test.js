const request = require('supertest');
const app = require('../src/app');
require('./setup');

describe('Tasks API (/api/tasks)', () => {
  let userAToken;
  let userBToken;
  let userAId;

  beforeEach(async () => {
    // Register User A
    const userARes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User A',
        email: 'usera@example.com',
        password: 'password123'
      });
    userAToken = userARes.body.data.token;
    userAId = userARes.body.data.user._id;

    // Register User B
    const userBRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User B',
        email: 'userb@example.com',
        password: 'password123'
      });
    userBToken = userBRes.body.data.token;
  });

  describe('POST /api/tasks', () => {
    it('should create a new task for the authenticated user', async () => {
      const taskData = {
        title: 'Complete Project Documentation',
        description: 'Write comprehensive README and API docs',
        priority: 'high',
        status: 'pending',
        dueDate: '2026-10-15T00:00:00.000Z'
      };

      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send(taskData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.task).toBeDefined();
      expect(res.body.data.task.title).toBe(taskData.title);
      expect(res.body.data.task.priority).toBe('high');
      expect(res.body.data.task.user.toString()).toBe(userAId.toString());
    });

    it('should NOT allow user to spoof user ownership via request body', async () => {
      const spoofedUserId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Tamper Attempt',
          user: spoofedUserId,
          userId: spoofedUserId
        });

      expect(res.status).toBe(201);
      // Ownership MUST remain with User A
      expect(res.body.data.task.user.toString()).toBe(userAId.toString());
    });

    it('should return 400 Bad Request if title is missing', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          description: 'Task without a title'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 Bad Request if priority is invalid', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Invalid Priority Task',
          priority: 'critical' // Not in enum: low, medium, high
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 Unauthorized if unauthenticated', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Unauthorized Task' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/tasks (Listing, Filters, Pagination)', () => {
    beforeEach(async () => {
      // Create 3 tasks for User A
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ title: 'Bug fixing in auth module', priority: 'high', status: 'pending' });

      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ title: 'Deploy to staging server', priority: 'medium', status: 'in-progress' });

      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ title: 'Write unit tests for models', priority: 'low', status: 'completed' });

      // Create 1 task for User B
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ title: "User B's secret task", priority: 'high', status: 'pending' });
    });

    it("should return ONLY the logged-in user's tasks", async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.tasks).toHaveLength(3);
      res.body.data.tasks.forEach((task) => {
        expect(task.user.toString()).toBe(userAId.toString());
      });
    });

    it('should filter tasks by status', async () => {
      const res = await request(app)
        .get('/api/tasks?status=completed')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.tasks).toHaveLength(1);
      expect(res.body.data.tasks[0].title).toBe('Write unit tests for models');
    });

    it('should search tasks by title or description', async () => {
      const res = await request(app)
        .get('/api/tasks?search=staging')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.tasks).toHaveLength(1);
      expect(res.body.data.tasks[0].title).toBe('Deploy to staging server');
    });

    it('should support pagination correctly', async () => {
      const res = await request(app)
        .get('/api/tasks?page=1&limit=2')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.tasks).toHaveLength(2);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBe(3);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(2);
      expect(res.body.pagination.totalPages).toBe(2);
      expect(res.body.pagination.hasNextPage).toBe(true);
      expect(res.body.pagination.hasPrevPage).toBe(false);
    });
  });

  describe('GET /api/tasks/:id', () => {
    let taskAId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ title: 'Task for single retrieval', priority: 'medium' });
      taskAId = res.body.data.task._id;
    });

    it('should get task by ID if owned by user', async () => {
      const res = await request(app)
        .get(`/api/tasks/${taskAId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.task._id).toBe(taskAId);
    });

    it('should return 400 Bad Request for invalid MongoDB ObjectId format', async () => {
      const res = await request(app)
        .get('/api/tasks/not-a-valid-object-id')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid task id format/i);
    });

    it('should return 404 Not Found for non-existent ObjectId', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .get(`/api/tasks/${nonExistentId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should return 404 Not Found when User B attempts to access User A's task", async () => {
      const res = await request(app)
        .get(`/api/tasks/${taskAId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT / PATCH /api/tasks/:id', () => {
    let taskAId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ title: 'Task to update', priority: 'low', status: 'pending' });
      taskAId = res.body.data.task._id;
    });

    it('should update task using PUT with valid fields', async () => {
      const res = await request(app)
        .put(`/api/tasks/${taskAId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Updated Task Title',
          status: 'completed',
          priority: 'high'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.task.title).toBe('Updated Task Title');
      expect(res.body.data.task.status).toBe('completed');
      expect(res.body.data.task.priority).toBe('high');
    });

    it('should partially update task using PATCH', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${taskAId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          status: 'in-progress'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.task.status).toBe('in-progress');
      expect(res.body.data.task.title).toBe('Task to update'); // Unchanged
    });

    it("should NOT allow User B to update User A's task", async () => {
      const res = await request(app)
        .patch(`/api/tasks/${taskAId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ title: 'Hacked by User B' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let taskAId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ title: 'Task to delete' });
      taskAId = res.body.data.task._id;
    });

    it("should NOT allow User B to delete User A's task", async () => {
      const res = await request(app)
        .delete(`/api/tasks/${taskAId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(404);

      // Verify task still exists for User A
      const verifyRes = await request(app)
        .get(`/api/tasks/${taskAId}`)
        .set('Authorization', `Bearer ${userAToken}`);
      expect(verifyRes.status).toBe(200);
    });

    it('should delete task successfully when requested by owner', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${taskAId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify task is gone
      const verifyRes = await request(app)
        .get(`/api/tasks/${taskAId}`)
        .set('Authorization', `Bearer ${userAToken}`);
      expect(verifyRes.status).toBe(404);
    });
  });
});
