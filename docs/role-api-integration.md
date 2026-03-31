# Role API Integration (Admin / Teacher / Student)

This project already uses **React + TypeScript (Vite)** on the frontend, **Node.js + Express** on the backend, and **MySQL** as the database.

## Backend Status Summary

### Admin side
Admin-facing modules are already wired to backend CRUD routes:
- Students (`/api/students`)
- Faculty/Teacher (`/api/faculty`)
- Events (`/api/events`)
- Scheduling (`/api/schedules`)
- Research (`/api/research`)
- Instruments (`/api/instruments`)
- Supporting masters: subjects, rooms, curriculum, departments

### Teacher side
Teacher functionality is represented by the `Faculty` backend routes:
- `GET /api/faculty/:id/dashboard`
- `GET /api/faculty/:id/load`
- `GET /api/faculty/:id/schedules`
- `GET /api/faculty/:id/students`
- `GET /api/faculty/:id/evaluations`
- `GET /api/faculty/:id/research`
- `GET /api/faculty/:id/events`
- `POST /api/faculty/:id/events/:eventId`

### Student side
Student backend routes are already available:
- `GET /api/students/:id/dashboard`
- `GET /api/students/:id`
- `GET /api/students/:id/academic`
- `GET /api/students/:id/courses`
- `GET /api/students/:id/grades`
- `GET /api/students/:id/schedules`
- `GET /api/students/:id/events`
- `POST /api/students/:id/events/:eventId`

## Important Role Mapping

The database `users.user_type` supports:
- `Admin`
- `Faculty`
- `Student`

To support your UI wording, backend auth registration now accepts **Teacher** and maps it to **Faculty** automatically.

## How to Access Per Role in UI

Current main app route pages:
- `/` dashboard
- `/students`
- `/faculty`
- `/events`
- `/scheduling`
- `/research`
- `/instruments`

If user role is:
- `Admin` → show full menu
- `Faculty` (Teacher) → show teacher-specific menu/items
- `Student` → direct to Student app pages

## Frontend API Integration Pattern

Use existing API helper:
- Main app: `src/app/utils/api.ts`

For Student Side app:
- Proxy is now configured in `Student Side/vite.config.ts` for `/api` → `http://localhost:5000`
- Use the same request style:

```ts
const dashboard = await api.get(`/students/${studentId}/dashboard`);
const grades = await api.get(`/students/${studentId}/grades`);
const schedules = await api.get(`/students/${studentId}/schedules`);
```

Teacher (Faculty) example:

```ts
const facultyDashboard = await api.get(`/faculty/${facultyId}/dashboard`);
const load = await api.get(`/faculty/${facultyId}/load`);
const schedules = await api.get(`/faculty/${facultyId}/schedules`);
```

## Suggested Minimal Next Wiring for Student Side

Student Side currently uses mock data in pages. Replace with API calls:
- `Dashboard.tsx` → `/students/:id/dashboard`, `/students/:id/events`
- `Profile.tsx` → `/students/:id`
- `AcademicProfile.tsx` → `/students/:id/academic`, `/students/:id/courses`
- `AcademicRecords.tsx` → `/students/:id/grades`
- `Activities.tsx` → `/students/:id/events`

Use the logged-in user's `ref_id` or mapped student id from login response.
