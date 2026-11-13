# Frontend (React + D3.js)

This directory contains the React single-page application. It handles the UI, routing, and renders the interactive D3.js charts.

## Folder structure
- src/assets/: Contains images and other static assets used in the frontend.

- src/charts/: Contains the D3.js charts and data visualisation components.

- src/components/: Contains reusable UI components such as Navbar.jsx.

- src/pages/: Contains the main application pages (Home.jsx, About/, ClusterExplorer/, RiskPredictor/).

- src/services/: Contains functions for communicating with the FastAPI backend.

- src/styles/: Contains CSS files for styling the application.

- src/App.jsx: Main React component that manages the application structure and routing.

- src/App.css: Contains styling for the main application component.

- src/index.css: Contains global CSS styling.

- src/main.jsx: Entry point of the React application.



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
