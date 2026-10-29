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
