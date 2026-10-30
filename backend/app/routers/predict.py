from fastapi import APIRouter
from app.schemas.risk import RiskRequest, RiskResponse
from app.services.risk_service import predict_lga_risk

router = APIRouter()

@router.post("/predict", response_model=RiskResponse)
def predict_risk(data: RiskRequest):
    # Call the service function
    result = predict_lga_risk(
        data.population, 
        data.severe_pct, 
        data.wet_weather_pct, 
        data.rural_road_pct
    )
    
    return {
        "risk_level": result["risk_level"],
        "probability": result["probability"],
        "threshold_used": result["threshold"],
        "inputs_received": data.dict()
    }