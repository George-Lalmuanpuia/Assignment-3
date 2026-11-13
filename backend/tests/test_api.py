import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# --- TEST 1: Valid Prediction ---
def test_predict_valid():
    response = client.post("/api/classification/predict", json={
        "population": 50000,
        "severe_pct": 60.0,
        "wet_weather_pct": 15.0,
        "avg_speed_limit": 80.0
    })
    assert response.status_code == 200
    assert "risk_level" in response.json()

# --- TEST 2: Missing Field ---
def test_predict_missing_field():
    response = client.post("/api/classification/predict", json={
        "severe_pct": 60.0,
        "wet_weather_pct": 15.0,
        "avg_speed_limit": 80.0
    })
    assert response.status_code == 422

# --- TEST 3: Invalid Percentage ---
def test_predict_invalid_percentage():
    response = client.post("/api/classification/predict", json={
        "population": 50000,
        "severe_pct": 150.0,
        "wet_weather_pct": 15.0,
        "avg_speed_limit": 80.0
    })
    assert response.status_code == 422

# --- TEST 4: Valid LGA ---
def test_get_lga_valid():
    response = client.get("/lgas/Camden")
    assert response.status_code == 200
    assert "data" in response.json()

# --- TEST 5: Invalid LGA ---
def test_get_lga_invalid():
    response = client.get("/lgas/Atlantis")
    assert response.status_code == 404

# --- TEST 6: All LGAs ---
def test_get_all_lgas():
    response = client.get("/lgas")
    assert response.status_code == 200
    assert len(response.json()["lgas"]) == 129

# --- TEST 7: Cluster PCA Data ---
def test_cluster_pca_data():
    response = client.get("/api/clusters/pca")
    assert response.status_code == 200
    assert len(response.json()) == 645

# --- TEST 8: Classification Predictions ---
def test_classification_predictions():
    response = client.get("/api/classification/predictions")
    assert response.status_code == 200
    assert len(response.json()) > 0