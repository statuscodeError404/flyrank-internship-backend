# DevCamper API

> A RESTful backend API for discovering and managing coding bootcamps, courses, and reviews.

---

## Overview

DevCamper is a full-featured REST API that allows users to create, manage, and discover bootcamps and courses. The platform supports user authentication, role-based authorization, review submissions, file uploads, and advanced query filtering.

---

### Running the Server

```bash
# Development 
npm run dev

## Features

- **Authentication & Authorization** — JWT-based auth with cookie support and role-based access control (admin, publisher, user)
- **Bootcamps** — Full CRUD, geospatial queries, photo uploads, and slug generation
- **Courses** — Linked to bootcamps with tuition tracking and average cost aggregation
- **Reviews** — User reviews with rating aggregation per bootcamp
- **Users** — Admin management of user accounts
- **Security** — Helmet, CORS, XSS sanitization, HPP protection, and rate limiting
- **API Docs** — Interactive Swagger UI

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js v23 |
| Framework | Express.js v4 |
| Database | PostgreSQL (Neon) via Prisma ORM |
| Auth | JSON Web Tokens + bcryptjs |
| File Upload | express-fileupload / multer |
| Docs | Swagger UI + YAML spec |
| Dev | Nodemon |

---

## Getting Started

### Prerequisites

- Node.js >= 18
- A PostgreSQL database (local or [Neon](https://neon.tech))

### Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=5000

DATABASE_URL=your_postgresql_connection_string

JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=25
SMTP_EMAIL=your_smtp_email
SMTP_PASSWORD=your_smtp_password
FROM_EMAIL=noreply@devcamper.io
FROM_NAME=DevCamper
```

---

## API Documentation

Interactive Swagger UI is available at:

```
http://localhost:5000/api-docs
```

---

## API Endpoints

| Resource | Base Route |
|---|---|
| Auth | `/api/v1/auth` |
| Bootcamps | `/api/v1/bootcamps` |
| Courses | `/api/v1/courses` |
| Reviews | `/api/v1/reviews` |
| Users | `/api/v1/users` |

### Auth

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/auth/register` | Register a new user | Public |
| POST | `/auth/login` | Login and receive token | Public |
| GET | `/auth/logout` | Clear auth cookie | Private |
| GET | `/auth/me` | Get current user | Private |
| PUT | `/auth/updatedetails` | Update name and email | Private |
| PUT | `/auth/updatepassword` | Update password | Private |
| POST | `/auth/forgotpassword` | Send password reset email | Public |
| PUT | `/auth/resetpassword/:token` | Reset password via token | Public |

### Bootcamps

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/bootcamps` | Get all bootcamps | Public |
| GET | `/bootcamps/:id` | Get single bootcamp | Public |
| POST | `/bootcamps` | Create bootcamp | Publisher/Admin |
| PUT | `/bootcamps/:id` | Update bootcamp | Publisher/Admin |
| DELETE | `/bootcamps/:id` | Delete bootcamp | Publisher/Admin |
| PUT | `/bootcamps/:id/photo` | Upload bootcamp photo | Publisher/Admin |
| GET | `/bootcamps/radius/:zipcode/:distance` | Get bootcamps within radius | Public |

### Courses

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/courses` | Get all courses | Public |
| GET | `/bootcamps/:bootcampId/courses` | Get courses for a bootcamp | Public |
| GET | `/courses/:id` | Get single course | Public |
| POST | `/bootcamps/:bootcampId/courses` | Add course to bootcamp | Publisher/Admin |
| PUT | `/courses/:id` | Update course | Publisher/Admin |
| DELETE | `/courses/:id` | Delete course | Publisher/Admin |

### Reviews

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/reviews` | Get all reviews | Public |
| GET | `/bootcamps/:bootcampId/reviews` | Get reviews for a bootcamp | Public |
| GET | `/reviews/:id` | Get single review | Public |
| POST | `/bootcamps/:bootcampId/reviews` | Add review | User/Admin |
| PUT | `/reviews/:id` | Update review | User/Admin |
| DELETE | `/reviews/:id` | Delete review | User/Admin |

### Users (Admin only)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/users` | Get all users |
| GET | `/users/:id` | Get single user |
| POST | `/users` | Create user |
| PUT | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |

---

## Author

**Mirza Omanovic** — [@ststuscodeError404](https://github.com/ststuscodeError404)

