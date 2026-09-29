const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/task_management_db',
  jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret_dev_key_replace_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || '*'
};

// Guard check for JWT secret in production
if (config.env === 'production' && config.jwtSecret.startsWith('default_jwt_secret')) {
  console.warn('[WARNING] Using default JWT_SECRET in production is dangerous. Set JWT_SECRET in your .env file.');
}

module.exports = config;
