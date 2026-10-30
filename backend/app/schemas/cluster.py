from pydantic import BaseModel

class ClusterRequest(BaseModel):
    lga_name: str
    year: int

class ClusterResponse(BaseModel):
    lga: str
    year: int
    cluster_id: int
    cluster_name: str
    features_used: dict