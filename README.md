# 🌱 Kindora – Social Development Platform API

**Building a better community, one event at a time.**

Kindora is a community-driven social development platform that connects people through meaningful community service activities. This repository contains the backend API responsible for event management, participant registration, authentication, and database operations.

🌐 **Live API:** https://kindora-rose.vercel.app

## ✨ Key Features

- **Event Management:** Create, view, update, and delete community events.
- **Upcoming Events:** Retrieve upcoming events sorted by date.
- **Recent Events:** Fetch the six nearest upcoming events.
- **Event Details:** Retrieve individual event information.
- **JWT Authentication:** Secure protected routes using Better Auth JWT verification.
- **Join Events:** Allow authenticated users to participate in upcoming events.
- **Joined Events:** Retrieve events joined by the authenticated user.
- **Ownership Protection:** Only event creators can update or delete their own events.
- **Input Validation:** Validate event information using Zod.
- **Duplicate Prevention:** Prevent users from joining the same event multiple times.

## 🛠️ Technologies Used

- Node.js
- Express.js
- MongoDB
- Better Auth JWT
- jose
- Zod
- CORS
- dotenv
- Nodemon
- Vercel

## 📡 API Endpoints

### General

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | API welcome message |
| GET | `/api/health` | Server health check |

### Events

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| GET | `/api/events` | Get all upcoming events | No |
| GET | `/api/events/recent` | Get six upcoming events | No |
| GET | `/api/events/:id` | Get event details | No |
| POST | `/api/events` | Create a new event | Yes |

### Manage Events

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/manage-events` | Get your created events |
| PATCH | `/api/manage-events/:id` | Update your event |
| DELETE | `/api/manage-events/:id` | Delete your event |

All Manage Events endpoints require authentication.

### Participants

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/participants/:eventId/join` | Join an upcoming event |
| GET | `/api/participants/joined` | Get your joined events |

Both participant endpoints require authentication.

## 🔐 Authentication

Protected API routes use Bearer Token authentication.

Include the JWT in the request header:

`Authorization: Bearer YOUR_JWT_TOKEN`

The server verifies tokens using the Better Auth JSON Web Key Set (JWKS) endpoint:

`/api/auth/jwks`

The authentication issuer and audience are configured using `AUTH_BASE_URL`.

## 🗄️ Database

Kindora uses MongoDB to store application data.

**Database:** `kindora`

**Collections:**
- `events` — Stores community events.
- `eventParticipants` — Stores event participation records.

A unique compound index on `eventId` and `userEmail` prevents duplicate participation records.

## ⚙️ Environment Variables

Create a `.env` file in the server root directory.

| Variable | Description |
|---|---|
| `PORT` | Server port |
| `CLIENT_URL` | Frontend application URL for CORS |
| `MONGODB_URI` | MongoDB connection string |
| `AUTH_BASE_URL` | Better Auth application URL for JWT verification |

Example configuration:

```env
PORT=5001
CLIENT_URL=http://localhost:3000
MONGODB_URI=your_mongodb_connection_string
AUTH_BASE_URL=http://localhost:3000
```

Never commit your actual `.env` file or secret credentials to GitHub.

## 🚀 Run Locally

### 1. Clone the Repository

```bash
git clone https://github.com/jahidhasannova/social-development-platform-server.git
```

### 2. Navigate to the Project Directory

```bash
cd social-development-platform-server
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the project root and add the required environment variables.

### 5. Start the Development Server

```bash
npm run dev
```

The server will run at:

`http://localhost:5001`

To start the production server:

```bash
npm start
```

## 🌍 Deployment

The backend API is deployed using Vercel.

**Production API:** https://kindora-rose.vercel.app

## 🎯 Project Purpose

Kindora aims to make community service more accessible by bringing event organizers and volunteers together through a single platform.

The backend provides the APIs and data management needed to support meaningful community initiatives.

---

**Developed with ❤️ by Jahid Hasan.**