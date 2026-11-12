from fastapi import APIRouter, HTTPException
from app.schemas.risk import RiskRequest, RiskResponse
from app.services.risk_service import predict_lga_risk
import pandas as pd
from pathlib import Path

router = APIRouter()

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"

@router.post("/predict", response_model=RiskResponse, tags=["AI Models"])
def predict_risk(data: RiskRequest):
    # Call the service function
    result = predict_lga_risk(
        data.population,
        data.severe_pct,
        data.wet_weather_pct,
        data.avg_speed_limit
    )
    
    return {
        "risk_level": result["risk_level"],
        "probability": result["probability"],
        "threshold_used": result["threshold"],
        "inputs_received": data.model_dump()
    }

# --- CHART ENDPOINTS Risk Predictor'S PAGE ---

@router.get("/api/classification/predictions", tags=["AI Models"])
def get_predictions():
    try:
        df = pd.read_csv(DATA_DIR / "logreg_test_predictions.csv")
        return df.to_dict(orient="records")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/classification/metrics", tags=["AI Models"])
def get_metrics():
    try:
        df = pd.read_csv(DATA_DIR / "logreg_metrics.csv")
        return df.to_dict(orient="records")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/classification/importance", tags=["AI Models"])
def get_importance():
    try:
        df = pd.read_csv(DATA_DIR / "logreg_permutation_importance.csv")
        return df.to_dict(orient="records")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/classification/coefficients", tags=["AI Models"])
def get_coefficients():
    try:
        df = pd.read_csv(DATA_DIR / "logreg_coefficients.csv")
        return df.to_dict(orient="records")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))