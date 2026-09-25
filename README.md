# TaskFlow — Backend

A RESTful backend API for the TaskFlow task management application.

The backend provides authentication, task management, database operations, and protected API endpoints for the frontend application.

## 🚀 Features

* 🔐 User authentication
* 👤 User management
* ✅ Task creation
* ✏️ Task updates
* 🗑️ Task deletion
* 🔄 Task status management
* 📋 Task retrieval
* 🔒 Protected API routes
* 🗄️ Database persistence
* 🌐 CORS configuration
* ⚙️ Environment-based configuration

## 🛠️ Tech Stack

* **Node.js** — JavaScript runtime
* **Express.js** — REST API framework
* **MongoDB** — Database
* **Mongoose** — MongoDB ODM
* **JWT** — Authentication
* **bcrypt** — Password hashing
* **dotenv** — Environment configuration

## 🏗️ Architecture

The backend provides the API layer between the TaskFlow frontend and the database.

```text id="f1c8yw"
TaskFlow-Backend/
├── middleware/
├── models/
├── routes/
├── controllers/
├── ...
├── server.js
├── package.json
└── ...
```

The backend is responsible for authentication, authorization, task operations, and data persistence.

## 🔐 Authentication

TaskFlow uses token-based authentication to protect user-specific resources.

Passwords are hashed before being stored in the database, and protected endpoints require a valid authentication token.

## 📡 API

The REST API provides endpoints for operations such as:

* User authentication
* Creating tasks
* Retrieving tasks
* Updating tasks
* Deleting tasks
* Updating task status

The frontend communicates with these endpoints through HTTP requests.

## 🗄️ Database

MongoDB is used to persist application data.

Task-related data is stored in the database and associated with the appropriate user.

## ⚙️ Getting Started

### Prerequisites

* Node.js 18+
* npm
* MongoDB

### Installation

Clone the repository:

```bash id="z6d1rb"
git clone https://github.com/wasem7112011/TaskFlow-Backend.git
```

Navigate to the project:

```bash id="y5v3hd"
cd TaskFlow-Backend
```

Install dependencies:

```bash id="2m8q9e"
npm install
```

### Environment Variables

Create a `.env` file in the project root.

Example:

```env id="q1k6ws"
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:3000
```

Use the exact environment variable names required by the project.

### Run the Server

Development:

```bash id="c4z8pn"
npm run dev
```

Production:

```bash id="n7v2mx"
npm start
```

The server will run on the configured port.

## 🔗 Frontend

This backend is designed to work with the TaskFlow frontend.

**Frontend Repository:**

https://github.com/wasem7112011/TaskFlow

## 📌 Technical Highlights

* RESTful API architecture
* Authentication and protected routes
* CRUD operations
* MongoDB data persistence
* User-specific task management
* Backend/frontend separation
* Environment-based configuration
