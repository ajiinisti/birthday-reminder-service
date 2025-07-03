# 🎂 Birthday Reminder Service

[![codecov](https://codecov.io/gh/ajiinisti/birthday-reminder-service/branch/main/graph/badge.svg)](https://codecov.io/gh/ajiinisti/birthday-reminder-service)

A Node.js RESTful API for managing users and sending birthday reminders at 9 AM based on each user's timezone. Built with **Express**, **MongoDB**, **Luxon**, and **Node-Cron**.

---

## 📦 Features

- ✅ CRUD operations for users  
- ⏰ Birthday worker runs hourly and logs birthday greetings  
- 🌐 Timezone validation via [IANA zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)  
- 🧪 Full test coverage using Jest & Supertest

---

## 🚀 Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/birthday-reminder-service.git
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

## ▶️ How to Run
```bash
   docker-compose up --build
```

---

## 🔧 Project Structure

```
src/
├── app.js
├── init.js
├── server.js
├── routes/
│   └── user.routes.js
├── controllers/
│   └── user.controller.js
├── models/
│   └── user.models.js
├── validators/
│   └── userValidator.js
└── worker/
    └── birthdayWorker.js

tests/
├── controllers/user.controller.test.js
├── models/user.models.test.js
├── validators/user.validator.test.js
└── worker/birthdayWorker.test.js
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

## ⏰ Birthday Cron Job

The worker runs every hour (`0 * * * *`).  
If it's **9 AM** in the user's timezone **and** it's their birthday:

```
🎉 Happy Birthday, John! (john@example.com)
```

You can find this logic in `src/worker/birthdayWorker.js`.

---

## 🛠 Tech Stack

- Node.js  
- Express  
- MongoDB + Mongoose  
- Luxon  
- Node-Cron  
- Jest + Supertest

---