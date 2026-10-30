import joblib
from pathlib import Path
import pandas as pd
import logging

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODEL_PATH = BASE_DIR / "models" / "kmeans_lga.joblib"
DATA_PATH = BASE_DIR / "data" / "lga_yearly_aggregates_clustering.csv"

try:
    cluster_bundle = joblib.load(MODEL_PATH)
    df = pd.read_csv(DATA_PATH)
    logger.info("Cluster model and data loaded successfully.")
except Exception as e:
    logger.warning(f"Could not load cluster model/data: {e}")
    cluster_bundle = None
    df = None

def predict_lga_cluster(lga_name, year):
    if cluster_bundle is None or df is None:
        return {"cluster_id": -1, "cluster_name": "MOCK Cluster"}

    # 1. Find the LGA in the CSV
    row = df[(df["LGA"].str.lower() == lga_name.lower()) & (df["Year"] == year)]
    if row.empty:
        return None # this error is handled in the router

    # 2. Extract features and predict
    features = cluster_bundle["features"]
    X_input = row[features].values
    scaler = cluster_bundle["scaler"]
    kmeans = cluster_bundle["kmeans"]
    
    X_scaled = scaler.transform(X_input)
    cluster_id = int(kmeans.predict(X_scaled)[0])
    cluster_name = cluster_bundle["cluster_names"][cluster_id]

    return {
        "cluster_id": cluster_id,
        "cluster_name": cluster_name,
        "features_used": dict(zip(features, X_input[0].tolist()))
    }