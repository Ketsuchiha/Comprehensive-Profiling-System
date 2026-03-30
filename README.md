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
