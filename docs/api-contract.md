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
  "years_available": [2020, 2021, 2022, 2023, 2024],
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
Accepts LGA features and return the logistic regression AI prediction.

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
```

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
  "year": 2020
}
```

**Success Response (200 OK):**
```json
{
  "lga": "Camden",
  "year": 2020,
  "cluster_id": 1,
  "cluster_name": "Mostly non-rural, lowest crash rate",
  "features_used": {
    "Crash rate per 100k": 143.17347111186206,
    "Severe %": 72.04968944099379,
    "Wet-weather %": 9.316770186335404,
    "Rural-road %": 0
  },
  "pc1": -1.3019,
  "pc2": -1.273,
  "is_mock": false
}
```
**Error Response (404 Not Found) - If LGA/Year is missing:**
```json
{"detail": "LGA or Year not found"}
```
## 5. GET /api/clusters/pca
Returns a list of all 645 LGA-year records with their K-Means cluster labels, DBSCAN noise flags, and PCA coordinates for the scatter plot.

**Request:** None

**Success Response (200 OK):**
```json
[
{
  "LGA": "Albury",
  "Year": 2020,
  "Population": 55466,
  "severe_count": 73,
  "non_severe_count": 50,
  "Wet-weather %": 12.195121951219512,
  "Rural-road %": 13.821138211382117,
  "Crash rate per 100k": 221.75747304655104,
  "Severe %": 59.34959349593496,
  "total_crashes": 123,
  "kmean data": 1,
  "dbscans data": 0,
  "PC1": -1.1889260299962772,
  "PC2": -0.11848650863850356,
  "is noise": false
}
]
```

## 6. GET /api/clusters/profiles
Returns the average feature values for each of the 3 K-Means clusters for the bar chart.

**Request:** None

**Success Response (200 OK):**
```json
[
  {
    "kmean data": 0,
    "Crash rate per 100k": 316,
    "Severe %": 76.28,
    "Wet-weather %": 11.35,
    "Rural-road %": 63.73
  },
  {
    "kmean data": 1,
    "Crash rate per 100k": 217.96,
    "Severe %": 67.15,
    "Wet-weather %": 18.42,
    "Rural-road %": 12.63
  },
  {
    "kmean data": 2,
    "Crash rate per 100k": 433.16,
    "Severe %": 67.95,
    "Wet-weather %": 26.93,
    "Rural-road %": 67.91
  }
]




