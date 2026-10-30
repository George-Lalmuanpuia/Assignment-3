import joblib
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODEL_PATH = BASE_DIR / "models" / "lga_risk_model.joblib"

try:
    risk_bundle = joblib.load(MODEL_PATH)
    logger.info("Risk model loaded successfully.")
except Exception as e:
    logger.warning(f"Could not load risk model (is it missing?): {e}")
    risk_bundle = None

def predict_lga_risk(population, severe, wet, rural):
    if risk_bundle is None:
        # Fallback mock data 
        return {"risk_level": "MOCK", "probability": 0.5, "threshold": 0.5}
    
    # 1. Format the input exactly as the model expects
    features = risk_bundle["features"]
    input_data = [[population, severe, wet, rural]]
    
    # 2. Make prediction
    pipeline = risk_bundle["pipeline"]
    prob = float(pipeline.predict_proba(input_data)[0][1])
    threshold = risk_bundle["threshold"]
    
    # 3. Post-process
    is_high = prob >= threshold
    return {
        "risk_level": "High" if is_high else "Low",
        "probability": round(prob, 4),
        "threshold": threshold
    }