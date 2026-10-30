# API Contract

## 1. GET /lgas
Returns a list of all 129 LGAs for the frontend dropdown.

**Request:** None

**Success Response (200 OK):**
```json
{
  "count": 129,
  "lgas": ["Albury", "Armidale", "Ballina"]
}
```

## 2. GET /lgas/{lga_name}
Returns historical data for a specific LGA.

**Path Parameter:** `lga_name` (string)

**Success Response (200 OK):**
```json
{
  "lga": "Camden",
  "years_available":,
  "data": [
    {
      "LGA": "Camden",
      "Year": 2020,
      "Population": 50000,
      "Wet-weather %": 12.5,
      "Rural-road %": 15.0,
      "Crash rate per 100k": 126.2,
      "Severe %": 60.0,
      "total_crashes": 150
    }
  ]
}
```

**Error Response (404 Not Found):**
```json
{
  "detail": "LGA 'Atlantis' not found"
}
```
## 3. POST /predict
Accepts LGA featurers and return the logistic regression AI prediction.

**Request Body:** 
```json
{
  "population": 50000,
  "severe_pct": 60.0,
  "wet_weather_pct": 15.0,
  "rural_road_pct": 20.0
}
```
**Success Response (200 OK):**
```json
{
  "risk_level": "High",
  "probability": 0.824,
  "threshold_used": 0.5,
  "inputs_received": {
    "population": 50000,
    "severe_pct": 60.0,
    "wet_weather_pct": 15.0,
    "rural_road_pct": 20.0
  }
}
**Error Response (422 Unprocessable Entity) - If validation fails:**
```json
{
  "detail": [
    {
      "loc": ["body", "severe_pct"],
      "msg": "ensure this value is less than or equal to 100",
      "type": "value_error.number.not_le"
    }
  ]
}
```
## 4. POST /cluster
Accepts an LGA name and Year, and returns the K-Means cluster prediction.

**Request Body:** 
```json
{
  "lga_name": "Camden",
  "year": 2024
}
```

**Success Response (200 OK):**
```json
{
  "lga": "Camden",
  "year": 2024,
  "cluster_id": 1,
  "cluster_name": "Mostly non-rural, lowest crash rate",
  "features_used": {
    "Crash rate per 100k": 126.2,
    "Severe %": 60.0,
    "Wet-weather %": 12.5,
    "Rural-road %": 15.0
  }
}
```
**Error Response (404 Not Found) - If LGA/Year is missing:**
```json
{"detail": "LGA or Year not found"}
```





