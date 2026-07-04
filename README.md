# 📝 Blog Project

A full-stack blog application with a **NestJS** backend and **React + Vite** frontend, fully containerized with Docker.

🌐 **Live:** [blog.sudipkhadka26.com.np](https://blog.sudipkhadka26.com.np)

---

## 📁 Project Structure

```
blog_node/
├── backend/          # NestJS REST API (Node.js)
├── frontend/         # React + Vite SPA
└── docker-compose.yml
```

---

## 🚀 Quick Start (Docker)

> Easiest way to run everything at once.

```bash
# 1. Clone the repo
git clone <repo-url> && cd blog_node

# 2. Set environment variables (see backend/.env.example)
cp backend/.env.example backend/.env

# 3. Start all services
docker-compose up --build
```

| Service  | URL                     |
|----------|-------------------------|
| Frontend | http://localhost:5173   |
| Backend  | http://localhost:3000   |

---

## ⚙️ Environment Variables

Copy and fill in the values before running:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Key variables:

| Variable        | Description                        |
|-----------------|------------------------------------|
| `MONGODB_URI`   | MongoDB Atlas connection string    |
| `JWT_SECRET`    | Secret key for JWT tokens          |
| `ADMIN_USERNAME`| Admin login username               |
| `ADMIN_PASSWORD`| Admin login password               |
| `VITE_API_URL`  | Frontend API base URL              |

---

## 🛠️ Development (without Docker)

```bash
# Backend (runs on :3000)
cd backend && npm install && npm run start:dev

# Frontend (runs on :5173)
cd frontend && npm install && npm run dev
```

---

## 🧪 Tests

```bash
# Backend unit tests
cd backend && npm test

# Backend test coverage
cd backend && npm run test:cov

# Frontend tests
cd frontend && npm test
```

---

## 📦 Useful Commands

```bash
# Stop and remove containers
docker-compose down

# Rebuild a single service
docker-compose up --build backend

# View logs
docker-compose logs -f

# Format backend code
cd backend && npm run format

# Lint frontend
cd frontend && npm run lint
```
