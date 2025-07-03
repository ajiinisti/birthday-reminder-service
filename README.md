# 🎂 Birthday Reminder Service

[![codecov](https://codecov.io/gh/ajiinisti/birthday-reminder-service/branch/main/graph/badge.svg)](https://codecov.io/gh/ajiinisti/birthday-reminder-service)

A Node.js RESTful API for managing users and sending birthday reminders at 9 AM based on each user's timezone. Built with **Express**, **BullMQ**, **Redis**, **MongoDB**, and **Luxon**.

---

## 📦 Features

- ✅ CRUD operations for users  
- ⏰ Auto-scheduled birthday jobs via BullMQ at 9 AM user time
- 🌐 Timezone validation via [IANA zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)  
- 🔁 Automatically recover scheduled jobs after server restart/crash
- 🔂 Retries up to 3 times if job fails (with exponential backoff)
- ♻️ Reschedules jobs on birthday/timezone change 
- 🧪 Test coverage using Jest & Supertest

---

## 🚀 Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/ajiinisti/birthday-reminder-service.git
   cd birthday-reminder-service
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create `.env` file**

   ```env
    PORT=3000
    MONGO_URI=mongodb://mongo:27017/birthdayDB
    NODE_ENV=local
   ```

4. **Create `.env.test` file**

   ```env
    MONGO_URI_TEST=mongodb://localhost:27017/birthday_test
    NODE_ENV=test
    PORT=5001
   ```

---

## 🐳 Run with Docker

```bash
# Build and run the service with Docker Compose
docker-compose up --build
```

---

## 🔧 Project Structure

```
src/
├── app.js
├── init.js
├── server.js
├── redis-setup.js
├── routes/
│   └── user.routes.js
├── controllers/
│   └── user.controller.js
├── models/
│   └── birthdaylog.models.js
│   └── user.models.js
├── validators/
│   └── userValidator.js
└── worker/
    ├── birthdayProcessor.js
    ├── scheduleBirthday.js
    └── birthdayQueue.js
tests/
├── controllers/user.controller.test.js
├── models/user.models.test.js
└── validators/user.validator.test.js
```

---

## 🧪 Run Tests

```bash (with coverage)
npm test
```

---

## 🧾 API Endpoints

- **POST `/users`** – Create a user  
- **GET `/users`** – Get all users  
- **GET `/users/:id`** – Get user by ID  
- **PUT `/users/:id`** – Update user  
- **DELETE `/users/:id`** – Delete user  

### Example Create Request

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "birthday": "1990-01-01",
  "timezone": "Asia/Jakarta"
}
```

---

## 🧠 Validation Rules

- `name`: Required  
- `email`: Required, must be valid  
- `birthday`: Required, must be ISO 8601  
- `timezone`: Required, must be valid IANA timezone

### 🌍 Valid Timezone value example

- America/New_York
- America/Chicago
- Europe/London
- Europe/Paris
- Asia/Jakarta
- Asia/Bangkok
- Africa/Cairo
- Africa/Nairobi
- Australia/Sydney
- Australia/Melbourne
- Asia/Dubai
- Asia/Riyadh

---

## ⏰ Birthday Scheduling (BullMQ)
- A job is scheduled to send a birthday message at 9 AM in user's timezone
- Only one job per user is maintained (jobId = birthday-<userId>)
- Jobs are rescheduled only if birthday or timezone changes
- Jobs lifecycle:
   - ➕ Created: when a user is added
   - 🔁 Rescheduled: when birthday/timezone is updated
   - 🗑 Removed: when user is deleted or invalid

Output
``` bash
🎉 Happy Birthday, John! (john@example.com)
```
---

## 🔁 Job Recovery After Server Restart
When the server starts, it runs a job validation function (scheduleAllBirthdays) that:
- Loads all active MongoDB users.
- Checks existing jobs in the queue (delayed, waiting, active).
- Reschedules any missing jobs, ensuring the system recovers after crash/restart.
This prevents lost birthday messages even if the server goes down temporarily.

---

## 🔃 Retry Mechanism
Each birthday message job is:
- Scheduled at 9 AM in the user’s timezone
- Given a unique jobId like birthday-<userId>
- Configured to retry up to 3 times
- Uses exponential backoff, starting with a 1-minute delay

---

## 🛠 Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- Luxon (timezone/date)
- Redis + BullMQ (job queue)
- Jest + Supertest (testing)
- Docker + Docker Compose

---

## 📝 Assumptions & Design Notes
- Birthday greetings are logged to console, not emailed
- You can view or clear Redis jobs using redis-cli on http://localhost:8081/
- Ensure server time and timezone are not affecting scheduled jobs

---