# Frontend (React + D3.js)

This directory contains the React single-page application. It handles the UI, routing, and renders the interactive D3.js charts.

## Folder structure
- src/assets/: Contains images and other static assets used in the frontend.

- src/charts/: Contains the D3.js charts and data visualisation components.

- src/components/: Contains reusable UI components such as Navbar.jsx.

- src/pages/: Contains the main application pages (Home,Risk Predictor, Cluster Explorer, About)

- src/App.jsx: Main React component that manages the application structure and routing.

- src/App.css: Contains styling for the main application component.

- src/index.css: Contains global CSS styling.

- src/main.jsx: Entry point of the React application.

- index.html: The main entry point.

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


-----------------------------------------------------------------------------------------------------------------------------------------
 ## Cluster Explorer (Jean-Luc)

The Cluster Explorer allows users to explore road safety patterns across New South Wales (NSW) Local Government Areas (LGAs) through interactive visualisations.

## Features

Scatter Plot: Displays LGA-year records using PCA coordinates (PC1 and PC2), with K-Means cluster labels and DBSCAN noise information.

Interactive Filters: Allows users to filter the Scatter Plot by year, LGA, K-Means cluster and DBSCAN results.

Cluster Profile Bar Chart: Displays the average road-safety feature values for each K-Means cluster.

Cluster Selection: Allows users to switch between individual clusters and view their corresponding feature profiles.

Interactive Charts: Uses D3.js to render the charts, including tooltips, dynamic updates and transitions.

# Data Files

The Cluster Explorer uses two processed CSV files:


lga_cluster_points.csv - Contains LGA-year records, PCA coordinates, K-Means cluster labels and DBSCAN noise information for the Scatter Plot.

cluster_profiles.csv - Contains the average road-safety feature values for each K-Means cluster, used by the Cluster Profile Bar Chart.

## Backend API Integration

The frontend retrieves the processed clustering data through the FastAPI backend.

/api/clusters/pca - Retrieves PCA coordinates and clustering information for the Scatter Plot.

/api/clusters/profiles - Retrieves average feature values for the Cluster Profile Bar Chart.

Ensure that the FastAPI backend is running before opening the Cluster Explorer page.

## Chart types used

React – Frontend components and interactive page functionality.

D3.js – Data-driven chart rendering, positioning, styling and transitions.

## File created
ScatterPlot.jsx
ScatterPlot.css

ClusterProfile.jsx
ClusterProfile.css

ClusterExplorer.jsx
ClusterExplorer.css
