# Frontend (React + D3.js)

This directory contains the React single-page application. It handles the UI, routing, and renders the interactive D3.js charts.

## Setup

1. **Install Node modules:**
   ```bash
   npm install
   ```
2. **Start the development server:**

   ```bash
   npm run dev
   ```
   The app will run at `http://localhost:5173`.

## Important Notes

- **CORS:** The backend is configured to only accept requests from port `5173`. If you run this app on a different port, API calls will fail.
- **API URL:** All API requests are directed to `http://127.0.0.1:8000`. Ensure the backend is running.
