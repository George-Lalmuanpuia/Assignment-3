from fastapi import APIRouter, HTTPException
from app.schemas.cluster import ClusterRequest, ClusterResponse
from app.services.cluster_service import predict_lga_cluster
import pandas as pd
from pathlib import Path

router = APIRouter()

# Path to the data folder
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"

# --- ENDPOINTS FOR CLUSTER PAGE'S CHARTS ---

@router.get("/api/clusters/pca", tags=["Clusters"])
def get_pca_points():
    """Returns all 645 PCA coordinates for Cluster page's scatter plot."""
    try:
        df = pd.read_csv(DATA_DIR / "lga_cluster_points.csv")
        # Convert NaN values to None for valid JSON
        df = df.where(pd.notnull(df), None)
        return df.to_dict(orient="records")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not load PCA data: {e}")

@router.get("/api/clusters/profiles", tags=["Clusters"])
def get_cluster_profiles():
    """Returns the average features per cluster for Cluster Page's bar chart."""
    try:
        df = pd.read_csv(DATA_DIR / "cluster_profiles.csv")
        return df.to_dict(orient="records")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not load cluster profiles: {e}")

# --- AI PREDICTION ENDPOINT ---

@router.post("/cluster", response_model=ClusterResponse, tags=["Clusters"])
def get_cluster(data: ClusterRequest):
    """Predicts the cluster for a custom user input."""
    result = predict_lga_cluster(data.lga_name, data.year)
    
    if result is None:
        raise HTTPException(status_code=404, detail="LGA or Year not found")
        
    return {
        "lga": data.lga_name,
        "year": data.year,
        "cluster_id": result["cluster_id"],
        "cluster_name": result["cluster_name"],
        "features_used": result["features_used"],
        "pc1": result["pc1"],
        "pc2": result["pc2"],
        "is_mock": result["is_mock"]
    }