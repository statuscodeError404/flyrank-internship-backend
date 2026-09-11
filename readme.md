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

## AI Review Summarizer

The headline feature of this platform: instead of reading 40+ reviews manually, call a single endpoint to get a structured, AI-generated summary of what reviewers actually think about a bootcamp.

### Endpoint

```
POST /api/v1/bootcamps/:id/summarize
```

**Access:** Public

### Example

```bash
curl -X POST http://localhost:5000/api/v1/bootcamps/22222222-2222-2222-2222-222222222004/summarize
```

**Response:**

```json
{
  "success": true,
  "cached": false,
  "data": {
    "overall_sentiment": "mixed",
    "top_pros": [
      "Instructors are brilliant communicators",
      "Curriculum is current",
      "Landed junior dev role after graduation",
      "Job guarantee worth the price",
      "Capstone project gives something real"
    ],
    "top_cons": [
      "Material felt outdated",
      "Career services almost non-existent",
      "Not recommended at this price point"
    ],
    "recommended_for": "Not enough data yet to make a reliable recommendation.",
    "confidence": 0.3,
    "review_count": 3
  }
}
```

### Caching

Generated summaries are stored in the database and reused on subsequent requests. A new summary is only generated when the review count for that bootcamp has changed (i.e. a new review was added or one was deleted). You can force a fresh regeneration regardless of cache state by passing `?force=true`. When the AI kill switch is active (`LLM_ENABLED=false`), the endpoint serves the last cached summary if one exists, or returns `503` otherwise.

### Query parameters

| Parameter | Description |
|---|---|
| `force=true` | Bypass cache and regenerate the summary |

### How it works

1. Fetches all reviews for the bootcamp from the database
2. Sends review text to an LLM (via OpenRouter) with a versioned prompt (`prompts/course-summary-v1.md`)
3. Validates the response against a strict Zod schema (sentiment enum, pros/cons arrays, confidence 0-1)
4. On validation failure, sends one repair call asking the model to fix its output
5. If repair also fails, returns `422` and logs the failure to `logs/quarantine.jsonl`
6. On success, caches the summary in the `BootcampSummary` table for instant reuse

### Environment variables

| Variable | Description |
|---|---|
| `LLM_BASE_URL` | LLM provider base URL (e.g. `https://openrouter.ai/api/v1`) |
| `LLM_API_KEY` | API key for the LLM provider |
| `LLM_MODEL` | Model identifier (e.g. `nvidia/nemotron-3.5-lightning:free`) |
| `LLM_STUB` | Set to `true` to return a hard-coded stub response (no model call) |
| `LLM_ENABLED` | Set to `false` to disable AI calls (serves cached summaries only) |

### Cost estimate

Using free-tier models on OpenRouter, the cost per summary is **$0.00**. With paid models like GPT-4o-mini, expect roughly $0.001-$0.005 per summary depending on the number of reviews.

---

## Author

**Mirza Omanovic** — [@ststuscodeError404](https://github.com/ststuscodeError404)

