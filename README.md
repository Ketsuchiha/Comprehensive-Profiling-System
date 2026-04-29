# CCS Comprehensive Profiling System
**ITEW6 Final Project | College of Computing Studies**

This repository contains the source code for the Comprehensive Profiling System, a digital solution designed to manage and organize student information efficiently.

## 🚀 Getting Started

To run this project locally, follow these steps:

1.  **Install Dependencies:**
    ```bash
    npm i
    ```
2.  **Start Development Server:**
    ```bash
    npm run dev
    ```

## 👥 The Development Team
**Pamantasan ng Cabuyao**

| Name                  | Role                            |
| :-------------------- | :------------------------------ |
| **Calugas, Gio**        | Backend Developer               |
| **Loberiano, Michelle** | Documentation & Quality Assurance |
| **Llamoso, Ria**        | UI/UX Designer                  |
| **Santos, Juriella Mae**| Frontend Developer              |

## 📝 Project Overview
The CCS Comprehensive Profiling System aims to replace manual filing systems with a centralized digital database. This ensures data integrity, quick retrieval of student records, and better academic tracking for the department.

## 🧱 Tech Stack
- Frontend: React + TypeScript (Vite)
- Backend: Node.js + Express
- Database: MySQL / MariaDB (`ccs123`)

## 🔌 Role API Coverage (Teacher/Student)
The backend now includes role-oriented endpoints that map to Teacher and Student portal needs:

- Student:
  - `GET /api/students/:id/dashboard`
  - `GET /api/students/:id/grades`
  - `GET /api/students/:id/schedules`
  - `GET /api/students/:id/events`
  - `POST /api/students/:id/events/:eventId`

- Teacher:
  - `GET /api/faculty/:id/dashboard`
  - `GET /api/faculty/:id/load`
  - `GET /api/faculty/:id/schedules`
  - `GET /api/faculty/:id/students`
  - `GET /api/faculty/:id/evaluations`
  - `GET /api/faculty/:id/research`
  - `GET /api/faculty/:id/events`
  - `POST /api/faculty/:id/events/:eventId`

Existing Admin CRUD routes remain available under `/api/*` (students, faculty, events, schedules, research, instruments, curriculum, departments, subjects, rooms).

## 🔗 Frontend Integration Guide
Use the existing API client at `src/app/utils/api.ts`.

Example:
```ts
const dashboard = await api.get(`/students/${studentId}/dashboard`);
const schedules = await api.get(`/faculty/${facultyId}/schedules`);
await api.post(`/students/${studentId}/events/${eventId}`, {});
```

## 🚀 Deploying with Vercel + Render

Use Vercel for the React frontend and Render for the Express API.

### 1) Deploy the backend on Render

1. Create a new Render web service from the `backend/` folder.
2. Use `npm install` as the build command and `npm start` as the start command.
3. Set these environment variables in Render:
  - `DB_HOST`
  - `DB_USER`
  - `DB_PASSWORD`
  - `DB_NAME`
  - `DB_PORT`
4. Make sure your MySQL/MariaDB instance is reachable from Render.
5. After deployment, copy the public backend URL, for example `https://your-backend.onrender.com`.

### 2) Deploy the frontend on Vercel

1. Import the repository into Vercel.
2. Set the project root to the repository root so Vercel builds the Vite app at the top level.
3. Leave the build command as `npm run build` and the output directory as `dist`.
4. Add these environment variables in Vercel:
  - `VITE_API_BASE_URL=https://your-backend.onrender.com/api`
  - `VITE_BACKEND_ORIGIN=https://your-backend.onrender.com`
5. Deploy.

### 3) Notes

- `src/app/utils/api.ts` now reads `VITE_API_BASE_URL`, so API calls can point at Render in production.
- `src/app/pages/Instruments.tsx` now reads `VITE_BACKEND_ORIGIN`, so uploaded file links resolve correctly outside local development.
- `vercel.json` keeps browser routing working on refresh.

### 4) Local development

For local work, you can keep using the existing Vite proxy and backend on `http://localhost:5000`.
