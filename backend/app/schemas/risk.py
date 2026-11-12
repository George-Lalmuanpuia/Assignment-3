from pydantic import BaseModel, Field

class RiskRequest(BaseModel):
    population: int = Field(..., gt=0, description="Population of the LGA")
    severe_pct: float = Field(..., ge=0, le=100, description="Percentage of severe crashes")
    wet_weather_pct: float = Field(..., ge=0, le=100, description="Percentage of wet-weather crashes")
    avg_speed_limit: float = Field(..., gt=0, description="Average speed limit (km/h)")

class RiskResponse(BaseModel):
    risk_level: str
    probability: float
    threshold_used: float
    inputs_received: dict