# Faculty Side

Faculty portal frontend for the CCS Comprehensive Profiling System.

## Frontend setup

1. Install dependencies:

```bash
npm i
```

2. Start the Faculty frontend:

```bash
npm run dev
```

The Faculty frontend runs on `http://localhost:5175`.

## Backend setup (required)

The Faculty portal uses the shared backend in [../backend](../backend).

1. Open the backend folder:

```bash
cd ../backend
```

2. Install dependencies:

```bash
npm i
```

3. Create `.env` from `.env.example` and confirm DB values:

```env
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=ccs123
DB_PORT=3306
PORT=5000
```

4. Start backend:

```bash
npm run dev
```

## Faculty API endpoints used by this app

- `POST /api/auth/login`
- `GET /api/faculty/:id/dashboard`
- `GET /api/faculty/:id`
- `GET /api/events`

## Dev proxy notes

- `Faculty Side/vite.config.ts` proxies:
  - `/api` -> `http://localhost:5000`
  - `/uploads` -> `http://localhost:5000`

This allows Faculty profile certificate links from backend uploads to open correctly in local development.
  