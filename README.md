# Office Attendance System

A professional web app for tracking staff attendance: check-in/check-out, staff management, and reports.

## Features

- **Dashboard** – Overview of total staff, present/absent today, and today’s attendance list
- **Staff** – Add, edit, and remove staff (name, email, department, role, employee ID)
- **Attendance** – Check-in and check-out by staff with today’s log
- **Reports** – Filter by date range and staff, summary (days present, total hours), and full attendance log

## Database

The app uses **SQLite** for persistence. Data is stored in `server/attendance.db`. The backend is a small Node.js (Express) API that the frontend talks to.

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Start both the API server and the frontend (recommended):

```bash
npm run dev:all
```

This runs the server on **http://localhost:3001** and the Vite app on **http://localhost:5173**. The frontend proxies `/api` to the server.

Or run them separately in two terminals:

- Terminal 1: `npm run server` (API on port 3001)
- Terminal 2: `npm run dev` (frontend on port 5173)

3. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build for production

```bash
npm run build
npm run preview
```

For production you’ll need to run the API server (e.g. `node server/index.js`) and host the `dist` folder. Set `VITE_API_URL` to your API base URL if it’s not at the same origin.
