from fastapi import APIRouter, HTTPException
import pandas as pd
from pathlib import Path

# 1. Create the router
router = APIRouter()

# 2. Define the path to the CSV and load it ONCE at startup
# (Going up 3 levels: routers - app - backend, then into data)
BASE_DIR = Path(__file__).resolve().parent.parent.parent 
DATA_PATH = BASE_DIR / "data" / "lga_yearly_aggregates_clustering.csv"

try:
    df = pd.read_csv(DATA_PATH)
    print(f"[LGAS ROUTER] Successfully loaded data: {len(df)} rows")
except Exception as e:
    print(f"[LGAS ROUTER] ERROR loading data: {e}")
    df = None

# 3. Endpoint: Get ALL LGAs (for the dropdown menu)
@router.get("/lgas")
def get_all_lgas():
    if df is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    # Get unique names, sort alphabetically
    unique_lgas = sorted(df["LGA"].unique().tolist())
    return {"count": len(unique_lgas), "lgas": unique_lgas}

# 4. Endpoint: Get data for a SPECIFIC LGA
@router.get("/lgas/{lga_name}")
def get_lga_details(lga_name: str):
    if df is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
    
    # Case-insensitive search (so 'camden' and 'Camden' both work)
    lga_data = df[df["LGA"].str.lower() == lga_name.lower()]
    
    # Error handling if LGA doesn't exist
    if lga_data.empty:
        raise HTTPException(status_code=404, detail=f"LGA '{lga_name}' not found")
    
    # Convert Pandas rows to a JSON-friendly list of dictionaries
    results = lga_data.round(2).to_dict(orient="records")
    
    return {
        "lga": lga_name,
        "years_available": lga_data["Year"].tolist(),
        "data": results
    }