const mongoose = require('mongoose');
const config = require('./env');

/**
 * Connect to MongoDB instance using Mongoose.
 *
 * @param {string} [uri] - Optional MongoDB URI override (e.g. for testing)
 * @returns {Promise<typeof mongoose>}
 */
const connectDB = async (uri = config.mongoUri) => {
  try {
    const os = require('os');
    const conn = await mongoose.connect(uri, {
      autoIndex: true,
      runtimeAdapters: { os }
    });

    if (config.env !== 'test') {
      console.log(`[Database] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    }

    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    if (config.env !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};

/**
 * Disconnect from MongoDB instance (useful for test teardown and graceful shutdown).
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
  } catch (error) {
    console.error(`[Database Error] Error disconnecting from MongoDB: ${error.message}`);
  }
};

module.exports = {
  connectDB,
  disconnectDB
};
