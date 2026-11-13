# RoadSafe: NSW LGA Road Risk Explorer

A full-stack web application that predicts road crash risk for Local Government Areas (LGAs) in New South Wales, Australia. The application uses machine learning models trained on historical crash data (2020–2024) and provides interactive data visualisations built with D3.js.

## Project Structure

- `/backend`: The FastAPI server, AI models, and data processing.
- `/frontend`: The React single-page application, D3.js charts, and UI.
- `/docs`: API contract, copy of the project report, contribution form, and meeting minutes.

## Quick Start

To run the full application, you need two terminal windows open at the same time.

**Terminal 1 (Backend):**

```bash
cd backend
# Follow the instructions in backend/README.md to set up the virtual environment
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Terminal 2 (Frontend):**

```bash
cd frontend
npm install
npm run dev
```
The frontend will run at `http://localhost:5173` and the backend API will run at `http://127.0.0.1:8000`.

## Documentation

- **Swagger API Docs:** `http://127.0.0.1:8000/docs` (Available when the backend is running).
- **API Contract:** See `docs/api-contract.md` for a full list of endpoints and expected JSON payloads.

