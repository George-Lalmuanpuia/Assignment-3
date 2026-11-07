from pydantic import BaseModel, Field

class ClusterRequest(BaseModel):
    lga_name: str = Field(..., min_length=1)
    year: int = Field(..., ge=2020, le=2024)

class ClusterResponse(BaseModel):
    lga: str
    year: int
    cluster_id: int
    cluster_name: str
    features_used: dict
    pc1: float      
    pc2: float     
    is_mock: bool