# 🖥️ Backend — NestJS API

REST API built with **NestJS**, **MongoDB (Mongoose)**, and **JWT authentication**.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment file and fill in values
cp .env.example .env

# Start in development mode (hot reload)
npm run start:dev
```

API runs at: **http://localhost:3000**

---

## ⚙️ Environment Variables

| Variable         | Description                              | Default                |
|------------------|------------------------------------------|------------------------|
| `PORT`           | Port the server listens on               | `3000`                 |
| `BACKEND_URL`    | Public URL of this backend               | `http://localhost:3000`|
| `FRONTEND_URL`   | Allowed CORS origin (frontend URL)       | `http://localhost:5173`|
| `MONGODB_URI`    | MongoDB connection string                | —                      |
| `JWT_SECRET`     | Secret for signing JWT tokens            | —                      |
| `ADMIN_USERNAME` | Admin account username                   | `admin`                |
| `ADMIN_PASSWORD` | Admin account password                   | —                      |

---

## 📜 Available Scripts

| Command               | Description                        |
|-----------------------|------------------------------------|
| `npm run start:dev`   | Start with hot reload (dev)        |
| `npm run start:prod`  | Start compiled production build    |
| `npm run build`       | Compile TypeScript to `dist/`      |
| `npm run lint`        | Lint and auto-fix with ESLint      |
| `npm run format`      | Format code with Prettier          |
| `npm test`            | Run unit tests                     |
| `npm run test:cov`    | Run tests with coverage report     |
| `npm run test:e2e`    | Run end-to-end tests               |

---

## 🗂️ Project Layout

```
src/
├── auth/         # JWT authentication & admin guard
├── blog/         # Blog post CRUD module
├── uploads/      # File upload handling
└── main.ts       # App entry point
```

---

## 🔑 Auth Notes

- JWT tokens are issued on login via `POST /api/v1/auth/login`
- Protected routes require `Authorization: Bearer <token>` header
- **Change `JWT_SECRET` and `ADMIN_PASSWORD` before deploying to production!**
