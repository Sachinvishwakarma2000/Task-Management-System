# Task Management System API

A production-ready RESTful Task Management API built with **Node.js**, **Express**, **MongoDB/Mongoose**, and **JWT Authentication**.

---

## 🚀 Features

- **Authentication & Authorization**: User registration, login, and secure JWT-based route protection.
- **Task Management**: Full CRUD operations (Create, Read, Update, Delete) for personal tasks.
- **Filtering, Pagination & Sorting**: Query tasks by status, priority, due date, and paginate through results.
- **Request Validation**: Schema-based validation using Joi for incoming payload and parameters.
- **Security & Error Handling**: Helmet for secure HTTP headers, CORS configuration, centralized error handling, and structured response formats.
- **Automated Testing**: Comprehensive test suite written with Jest and Supertest.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (jsonwebtoken) & bcryptjs
- **Validation**: Joi
- **Testing**: Jest & Supertest

---

## 📦 Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB](https://www.mongodb.com/) (running locally or a MongoDB Atlas URI)

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd Task-Management-System
npm install
```

### 3. Environment Setup

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Configure your environment variables in `.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/task_management_db
JWT_SECRET=your_jwt_secret_key_minimum_32_characters_long
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
```

### 4. Running the Application

```bash
# Start in development mode (with file watcher)
npm run dev

# Start in production mode
npm start
```

### 5. Running Tests

```bash
npm test
```

---

## 📖 API Endpoints

### Auth Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Register a new user | No |
| `POST` | `/api/v1/auth/login` | Login user & receive JWT | No |
| `GET` | `/api/v1/auth/profile` | Get current authenticated user profile | Yes |

### Task Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/tasks` | Get all tasks (supports query filters, sort, page) | Yes |
| `POST` | `/api/v1/tasks` | Create a new task | Yes |
| `GET` | `/api/v1/tasks/:id` | Get details of a single task | Yes |
| `PUT` | `/api/v1/tasks/:id` | Update an existing task | Yes |
| `DELETE` | `/api/v1/tasks/:id` | Delete a task | Yes |

---

## 📁 Project Structure

```
├── .env.example
├── .gitignore
├── package.json
├── server.js
├── README.md
├── src
│   ├── app.js
│   ├── config/         # Database and app configurations
│   ├── controllers/    # Request handlers
│   ├── middlewares/    # Auth, validation, and error middlewares
│   ├── models/         # Mongoose data models
│   ├── routes/         # Express API route declarations
│   ├── services/       # Core business logic
│   ├── utils/          # Helper utilities and custom error classes
│   └── validators/     # Joi validation schemas
└── tests               # Unit and integration tests
```

---

## 📄 License

This project is licensed under the ISC License.
