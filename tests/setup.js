const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../src/config/db');

const TEST_DB_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/task_management_test_db';

beforeAll(async () => {
  await connectDB(TEST_DB_URI);
});

afterAll(async () => {
  // Drop the test database and close connection
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.connection.dropDatabase();
    } catch {
      // Ignore if cannot drop
    }
    await disconnectDB();
  }
});

beforeEach(async () => {
  // Clear all collections between tests
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});
