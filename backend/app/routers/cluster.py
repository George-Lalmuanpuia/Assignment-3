from fastapi import APIRouter, HTTPException
from app.schemas.cluster import ClusterRequest, ClusterResponse
from app.services.cluster_service import predict_lga_cluster

router = APIRouter()

@router.post("/cluster", response_model=ClusterResponse)
def get_cluster(data: ClusterRequest):
    result = predict_lga_cluster(data.lga_name, data.year)
    
    if result is None:
        raise HTTPException(status_code=404, detail="LGA or Year not found")
        
    return {
        "lga": data.lga_name,
        "year": data.year,
        "cluster_id": result["cluster_id"],
        "cluster_name": result["cluster_name"],
        "features_used": result["features_used"]
    }