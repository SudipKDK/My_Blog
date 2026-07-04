# 🎨 Frontend — React + Vite

SPA built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS**.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment file and fill in values
cp .env.example .env

# Start dev server (hot reload)
npm run dev
```

App runs at: **http://localhost:5173**

---

## ⚙️ Environment Variables

| Variable       | Description                                | Example                           |
|----------------|--------------------------------------------|-----------------------------------|
| `VITE_API_URL` | Backend API base URL (must start with `VITE_`) | `http://localhost:3000/api/v1` |

> ⚠️ Only variables prefixed with `VITE_` are exposed to the browser by Vite.

---

## 📜 Available Scripts

| Command                  | Description                          |
|--------------------------|--------------------------------------|
| `npm run dev`            | Start local dev server on `:5173`    |
| `npm run build`          | Type-check and build for production  |
| `npm run preview`        | Preview the production build locally |
| `npm run lint`           | Lint code with ESLint                |
| `npm test`               | Run tests with Vitest (watch mode)   |
| `npm run test:run`       | Run tests once (CI mode)             |
| `npm run test:coverage`  | Run tests with coverage report       |
| `npm run test:ui`        | Open Vitest UI in browser            |

---

## 🗂️ Project Layout

```
src/
├── components/     # Reusable UI components
├── pages/          # Route-level page components
├── hooks/          # Custom React hooks
├── services/       # Axios API calls
├── types/          # TypeScript interfaces
└── main.tsx        # App entry point
```

---

## 🏗️ Production Build

```bash
npm run build
# Output goes to: dist/
```

The `dist/` folder is served by **Nginx** inside the Docker container.
