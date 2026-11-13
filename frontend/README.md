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


-----------------------------------------------------------------------------------------------------------------------------------------
## Risk Predictor (Teh Zhi Xiang)
The Risk Predictor allows users to explore how well a Logistic Regression model predicts high crash risk across New South Wales (NSW) Local Government Areas (LGAs). An LGA is classified as high risk when it has above median amount of crashes or 254.9 or more crashes per 100,000 residents.

## Features
ROC Curve: Displays the trade-off between true positive and false positive rates at different probability thresholds, with the AUC value and a marker showing the selected threshold.

Confusion Matrix: Displays the true negatives, false positives, false negatives and true positives for the 2024 test set, updating when the threshold changes.

Feature Importance Chart: Displays the importance of each feature, with a toggle to show whether each feature pushes an LGA towards high or low risk.

Interactive Filters: Allows users to adjust the probability threshold, search for LGAs, filter by predicted risk level and show only incorrect predictions.

LGA Predictions Table: Displays each LGA's predicted risk probability, predicted risk level and actual risk level.

Risk Predictor Form: Allows users to enter hypothetical LGA characteristics, including population, severe crash percentage, wet-weather crash percentage and average speed limit, to receive a predicted risk level and probability.

## Data Files
The Risk Predictor uses four processed CSV files and one trained model:

logreg_test_predictions.csv - Contains the 2024 test set predictions, actual labels and predicted probabilities, used by the ROC Curve, Confusion Matrix and LGA Predictions Table.

logreg_metrics.csv - Contains the model's summary performance metrics.

logreg_permutation_importance.csv - Contains the permutation importance values used by the Feature Importance Chart.

logreg_coefficients.csv - Contains the Logistic Regression coefficients used by the direction view.

lga_risk_model.joblib - Contains the trained Scikit-Learn Pipeline, used by the backend to make predictions from user inputs.

## Backend API Integration
The frontend retrieves model results and predictions through the FastAPI backend.
- /api/classification/predictions - Retrieves test set predictions.
- /api/classification/metrics - Retrieves model evaluation metrics.
- /api/classification/importance - Retrieves feature importance values.
- /api/classification/coefficients - Retrieves model coefficients.
- /api/classification/predict - Receives user inputs from the Risk Predictor Form and returns a predicted risk level and probability.
Ensure that the FastAPI backend is running before opening the Risk Predictor page.

## Chart types used
React – Frontend components, form handling, filters and interactive page functionality.

D3.js – Data-driven chart rendering, scales, colour schemes, tooltips and interactive updates.

FastAPI – Backend API for retrieving model results and processing user predictions.

Scikit-Learn – Logistic Regression model training, prediction and performance evaluation.

## File created
CrashRiskModel.jsx

CrashRiskModel.css

RiskPredictorForm.jsx

RiskPredictorForm.css

RiskPredictor.jsx
