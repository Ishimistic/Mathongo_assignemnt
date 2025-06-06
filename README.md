# Chapter Tracker

This repository contains the backend implementation for a Chapter Tracker API built with Node.js, Express, MongoDB, and Redis. It provides endpoints to manage chapters and admin authentication.

## Features

- **Admin Authentication:** Register and login routes for admin users using JWT authentication.
- **Chapter Management:** CRUD operations for chapters, with support for filtering, pagination, and caching.
- **Rate Limiting:** Implements rate limiting middleware to restrict API access based on IP address.

## Installation

1. Clone the repository:
```bash
   git clone <repository-url>
   cd <repository-folder>
```
2. Install dependencies:
```bash
npm install
```
3. Set up environment variables:
Create a .env file in the root directory.
Define the following variables:
```bash
MONGO_URI=<mongodb-uri>
REDIS_HOST=<redis-host>
REDIS_PORT=<redis-port>
REDIS_PASSWORD=<redis-password>
JWT_SECRET=<jwt-secret>
```
4. Run the server
```bash
node server.js
```
## API Endpoints

### Auth Routes
1. POST /api/auth/register
- Registers a new admin user.
- Body: { name, email, password }

2. POST /api/auth/login
- Logs in an admin user.
- Body: { email, password }

### Chapter Routes
1. GET /api/chapters/
- Retrieves all chapters with optional filters.
- Query Params: class, unit, status, subject, weakChapters, page, limit

2. POST /api/chapters/
- Creates a new chapter.
- Requires JWT token for authentication.
- Body: { subject, chapter, class, unit, ... }

3. GET /api/chapters/:id
- Retrieves a single chapter by ID.
- Params: id


### Error Handling
Global error handling middleware to manage exceptions and server errors.

### Dependencies
- Express.js: Web framework for Node.js
- Mongoose: MongoDB object modeling tool
- Redis: In-memory data structure store for caching
- JWT: JSON Web Token for authentication
