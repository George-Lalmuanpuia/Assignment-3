from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 1. Import the routers
from app.routers import lgas, cluster, risk

app = FastAPI(title="NSW LGA Road Risk API")

# 2. CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Attach the routers to the app
app.include_router(lgas.router, tags=["Data"])
app.include_router(risk.router, tags=["AI Models"])
app.include_router(cluster.router, tags=["Clusters"])

# 4. Health check
@app.get("/")
def read_root():
    return {"message": "API is running!"}