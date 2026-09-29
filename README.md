# Task Management REST API

A production-grade, secure RESTful API built with **Node.js**, **Express.js**, **MongoDB**, and **Mongoose**. It features stateless **JWT authentication**, role and ownership isolation, input validation with **Joi**, centralized error handling, and security hardening with **Helmet** and **CORS**.

---

## Table of Contents
- [Features](#features)
- [Architecture & Project Structure](#architecture--project-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
  - [Authentication Endpoints](#authentication-endpoints)
  - [Task Endpoints](#task-endpoints)
  - [System Endpoints](#system-endpoints)
- [Automated Testing](#automated-testing)
- [Postman Collection](#postman-collection)
- [Design & Security Decisions](#design--security-decisions)

---

## Features

- **Robust Authentication**: JWT-based stateless authentication with bcrypt password hashing (10 salt rounds).
- **Multi-Tenant Ownership Isolation**: Users strictly read, update, and delete only their own tasks.
- **Request Validation**: Schema-based validation using Joi with meaningful client error responses.
- **Resilient MongoDB Handling**: Guards against invalid MongoDB `ObjectId` inputs with HTTP 400 instead of 500 crashes.
- **Clean Error Handling**: Centralized error middleware handling operational vs. programming errors, MongoDB duplicate keys (HTTP 409), and hidden stack traces in production.
- **Pagination, Search & Filtering**: Built-in support for page, limit, status, priority, and text search across title and description.
- **Security Hardening**: Protected HTTP headers via Helmet, configurable CORS, and body size limits against denial-of-service.
- **Automated Test Suite**: 29 unit and integration tests covering the full API surface using Jest and Supertest.

---

## Architecture & Project Structure

The project follows a multi-tier, modular architecture separating concerns cleanly across controllers, services, models, middlewares, routes, and validators:

```
Task-Management-System/
├── .env                              # Local environment configurations (git-ignored)
├── .env.example                      # Template environment variables
├── .gitignore                        # Git exclusion rules
├── package.json                      # Dependencies and scripts
├── server.js                         # Application entrypoint & DB lifecycle
├── postman_collection.json           # Postman Collection v2.1 with automated tests
├── src/
│   ├── app.js                        # Express application configuration & middlewares
│   ├── config/
│   │   ├── db.js                     # MongoDB connection with Mongoose
│   │   └── env.js                    # Validated environment configuration
│   ├── controllers/
│   │   ├── auth.controller.js        # Auth request handlers
│   │   └── task.controller.js        # Task request handlers
│   ├── middlewares/
│   │   ├── auth.middleware.js        # JWT verification & req.user hydration
│   │   ├── error.middleware.js       # Centralized error handler
│   │   └── validate.middleware.js    # Joi request validation middleware
│   ├── models/
│   │   ├── task.model.js             # Mongoose Task schema and indexes
│   │   └── user.model.js             # Mongoose User schema with pre-save hashing
│   ├── routes/
│   │   ├── auth.routes.js            # Auth routes (/api/auth)
│   │   ├── index.js                  # Central router aggregating sub-routers
│   │   └── task.routes.js            # Task routes (/api/tasks)
│   ├── services/
│   │   ├── auth.service.js           # Auth business logic & token generation
│   │   └── task.service.js           # Task business logic, filters, and isolation
│   ├── utils/
│   │   ├── apiError.js               # Custom operational error class
│   │   ├── apiResponse.js            # Standardized JSON response envelope
│   │   └── asyncHandler.js           # Async try/catch wrapper
│   └── validators/
│       ├── auth.validator.js         # Joi schemas for auth payloads
│       └── task.validator.js         # Joi schemas for task payloads and query params
└── tests/
    ├── setup.js                      # Jest test database connection & teardown
    ├── auth.test.js                  # Registration, login, profile integration tests
    └── task.test.js                  # Task CRUD, filters, pagination, ownership tests
```

---

## Prerequisites

- **Node.js**: v18.0.0 or later (v20+ or v24 recommended)
- **npm**: v9.0.0 or later
- **MongoDB**: v6.0 or later (locally running on `127.0.0.1:27017` or a MongoDB Atlas URI)

---

## Environment Variables

Copy `.env.example` to create your local `.env`:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5001` | Port on which the Express server listens |
| `NODE_ENV` | `development` | Runtime environment (`development`, `production`, `test`) |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/task_management_db` | MongoDB connection string |
| `JWT_SECRET` | `super_secret_jwt_key...` | Cryptographic secret for signing JWTs |
| `JWT_EXPIRES_IN` | `7d` | Token expiry duration (e.g. `24h`, `7d`) |
| `CORS_ORIGIN` | `*` | Allowed CORS origins (or comma-separated URLs) |

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Verify MongoDB is Running
Make sure MongoDB is running on your machine:
```bash
# macOS (Homebrew)
brew services start mongodb-community
```

### 3. Run the Development Server
```bash
npm run dev
```

### 4. Run in Production
```bash
npm start
```
The server will start at `http://localhost:5001/api`.

---

## API Documentation

All responses follow a consistent JSON format:
```json
// Success Response
{
  "success": true,
  "message": "Human-readable message",
  "data": { ... },
  "pagination": { ... } // (when listing collections)
}

// Error Response
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ] // (field-level validation details if applicable)
}
```

### Authentication Endpoints

#### 1. Register User
- **Method / Route**: `POST /api/auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "StrongPassword123"
}
```
- **Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "6701c9...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "createdAt": "2026-09-29T15:00:00.000Z",
      "updatedAt": "2026-09-29T15:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
}
```

#### 2. Login User
- **Method / Route**: `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "jane@example.com",
  "password": "StrongPassword123"
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "6701c9...",
      "name": "Jane Doe",
      "email": "jane@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
}
```

#### 3. Get Current User Profile
- **Method / Route**: `GET /api/auth/me`
- **Access**: Private (Requires `Authorization: Bearer <token>`)
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "_id": "6701c9...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "createdAt": "2026-09-29T15:00:00.000Z"
    }
  }
}
```

---

### Task Endpoints

*All task endpoints require the `Authorization: Bearer <token>` header.*

#### 1. Create Task
- **Method / Route**: `POST /api/tasks`
- **Access**: Private
- **Request Body**:
```json
{
  "title": "Design Database Schema",
  "description": "Create ER diagram and Mongoose models for task management",
  "priority": "high",
  "status": "pending",
  "dueDate": "2026-10-15T18:00:00.000Z"
}
```
*Note: `priority` can be `low`, `medium`, or `high`. `status` can be `pending`, `in-progress`, or `completed`.*
- **Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "task": {
      "_id": "6701d4...",
      "title": "Design Database Schema",
      "description": "Create ER diagram and Mongoose models for task management",
      "priority": "high",
      "status": "pending",
      "dueDate": "2026-10-15T18:00:00.000Z",
      "user": "6701c9...",
      "createdAt": "2026-09-29T15:05:00.000Z",
      "updatedAt": "2026-09-29T15:05:00.000Z"
    }
  }
}
```

#### 2. List Tasks
- **Method / Route**: `GET /api/tasks`
- **Access**: Private (Returns only the authenticated user's tasks)
- **Optional Query Parameters**:
  - `page`: Page number (default: `1`)
  - `limit`: Tasks per page (default: `10`, max: `100`)
  - `status`: Filter by status (`pending`, `in-progress`, `completed`)
  - `priority`: Filter by priority (`low`, `medium`, `high`)
  - `search`: Case-insensitive search string matching title or description
  - `sortBy`: Field to sort by (`createdAt`, `dueDate`, `priority`, `title`) (default: `createdAt`)
  - `order`: `asc` or `desc` (default: `desc`)
- **Example**: `GET /api/tasks?page=1&limit=5&status=pending&search=database`
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": {
    "tasks": [
      {
        "_id": "6701d4...",
        "title": "Design Database Schema",
        "description": "Create ER diagram and Mongoose models for task management",
        "priority": "high",
        "status": "pending",
        "dueDate": "2026-10-15T18:00:00.000Z",
        "user": "6701c9...",
        "createdAt": "2026-09-29T15:05:00.000Z"
      }
    ]
  },
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 5,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

#### 3. Get Task by ID
- **Method / Route**: `GET /api/tasks/:id`
- **Access**: Private (User can access only their own task)
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Task retrieved successfully",
  "data": {
    "task": {
      "_id": "6701d4...",
      "title": "Design Database Schema",
      "priority": "high",
      "status": "pending",
      "user": "6701c9..."
    }
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: If `:id` is not a valid 24-character hexadecimal MongoDB ObjectId.
  - `404 Not Found`: If the task does not exist or belongs to another user.

#### 4. Update Task (PUT / PATCH)
- **Method / Route**: `PUT /api/tasks/:id` or `PATCH /api/tasks/:id`
- **Access**: Private (User can update only their own task)
- **Request Body** (at least one field required):
```json
{
  "status": "completed",
  "priority": "medium"
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "task": {
      "_id": "6701d4...",
      "title": "Design Database Schema",
      "status": "completed",
      "priority": "medium"
    }
  }
}
```

#### 5. Delete Task
- **Method / Route**: `DELETE /api/tasks/:id`
- **Access**: Private (User can delete only their own task)
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Task deleted successfully",
  "data": null
}
```

---

### System Endpoints

- `GET /health`: Health check returning server uptime, timestamp, and status.
- `GET /api`: API directory listing all available routes.

---

## Automated Testing

The project includes an automated test suite with **29 test cases** across authentication and task operations. Tests run against an isolated test database (`task_management_test_db`).

Run all tests:
```bash
npm test
```

Run tests with test coverage summary:
```bash
npm run test:coverage
```

### Tested Scenarios:
1. **Authentication**:
   - Registration with valid data and JWT generation.
   - Prevention of password exposure in responses.
   - Duplicate email registration handling (HTTP 409).
   - Validation failure on missing fields, bad email format, short passwords (HTTP 400).
   - Successful login with correct credentials.
   - Rejection of invalid passwords and non-existent accounts (HTTP 401).
   - Profile retrieval with token, missing token, and invalid token.
2. **Tasks & Authorization**:
   - Task creation with required and optional fields.
   - Tamper protection: ignores spoofed `userId` in request body and strictly enforces authenticated JWT identity.
   - Task validation for title, status, and priority enums.
   - Multi-tenant isolation: User A cannot read, update, or delete User B's task.
   - Paginated listings, status filtering, and regex keyword searching.
   - Safe ObjectId handling (HTTP 400 for malformed IDs without server crashes).
   - PUT full updates and PATCH partial updates.
   - Deletion of user's task and verification of 404 on subsequent queries.

---

## Postman Collection

A complete Postman Collection file is provided in the repository:
[`postman_collection.json`](file:///Users/apple/Workspace/Task-Management-System/postman_collection.json).

### How to Import & Use:
1. Open Postman.
2. Click **Import** (top left) and select `postman_collection.json`.
3. Set your collection variable `baseUrl` to `http://localhost:5001` (already configured).
4. Run the **Register User** or **Login User** request:
   - A built-in Postman test script automatically extracts the JWT and stores it in `{{authToken}}`.
5. Run the **Create Task** request:
   - The test script automatically saves the generated task ID into `{{taskId}}`.
6. All subsequent requests (Get Profile, Get Task, Update, Delete) automatically use `{{authToken}}` and `{{taskId}}`.

---

## Design & Security Decisions

1. **Separation of Concerns (Controller-Service-Model Architecture)**:
   - **Controllers**: Handle HTTP-specific logic (reading headers/params, validating, formatting status codes).
   - **Services**: Contain pure business logic (queries, filtering, hashing, token issuance), making code testable and reusable.
   - **Models**: Enforce schema constraints, indexes, and document hooks.

2. **Multi-Tenant Ownership & Zero-Trust `userId`**:
   - The client is never allowed to specify the task owner (`user` or `userId`) in the request body or query parameters.
   - The user identity is extracted purely from the verified JWT in the `authenticate` middleware (`req.user._id`).
   - Every task query scopes by both `_id` and `user: req.user._id` (`{ _id: taskId, user: req.user._id }`). Attempts by other users to view, edit, or delete a task return `404 Not Found` to prevent resource enumeration attacks.

3. **Password Security**:
   - Passwords are encrypted using `bcryptjs` with salt round 10 inside a Mongoose `pre('save')` hook.
   - In Mongoose schema, `password` is marked with `select: false`.
   - The `toJSON` transform explicitly deletes `password` and `__v` ensuring no controller response leaks credentials.

4. **Guarding against Malformed ObjectIds**:
   - Express parameter validators check that `:id` matches `/^[0-9a-fA-F]{24}$/`.
   - The global error handler catches Mongoose `CastError` and returns `400 Bad Request` instead of letting unhandled errors crash the server.

5. **Defense-in-Depth Middleware**:
   - **Helmet**: Sets secure HTTP response headers (Content-Security-Policy, X-DNS-Prefetch-Control, Strict-Transport-Security, etc.).
   - **CORS**: Configurable cross-origin request handling.
   - **Body Limits**: Body parser limited to `10kb` to thwart volumetric JSON denial-of-service attacks.
   - **Error Cloaking**: Internal stack traces and server internals are suppressed in production mode.
   - **Graceful Shutdown**: Intercepts `SIGINT` and `SIGTERM` signals to finish in-flight requests and cleanly close database connections before exiting.
