# Backend (FastAPI + AI Models)

This directory contains the FastAPI backend, which handles API requests, validates data with Pydantic, and runs the Scikit-Learn models.

## Folder Structure

- `app/routers/`: Contains the API endpoint definitions (lgas.py, risk.py, cluster.py).
- `app/schemas/`: Contains Pydantic models for request validation.
- `app/services/`: Contains the logic that loads the .joblib models and runs predictions.
- `data/`: Contains the historical CSV data and exported model metrics.
- `models/`: Contains the saved .joblib files (Logistic Regression, K-Means, PCA).
- `tests/`: Contains the automated pytest suite.

## Setup

1. **Create a virtual environment:**
   - **Mac/Linux:** `python3 -m venv .venv && source .venv/bin/activate`
   - **Windows:** `python -m venv .venv && .venv\Scripts\activate`

2. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

3. **Run the server:**

   ```bash
   uvicorn app.main:app --reload
   ```

   The API will be live at `http://127.0.0.1:8000`. You can view the Swagger UI at `/docs`.

## AI Model Configuration

The pre-trained models are loaded into memory on startup:

- `models/lga_risk_model.joblib`: Logistic Regression model.
- `models/kmeans_lga.joblib`: K-Means and PCA models.

If these files are missing, the API falls back to returning "MOCK" predictions so the frontend does not crash.

## Testing

Run the automated test suite:

```bash
pytest
```


