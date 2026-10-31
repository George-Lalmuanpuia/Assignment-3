from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 1. Import the router
from app.routers import lgas, cluster
from backend.app.routers import risk

app = FastAPI(title="NSW LGA Road Risk API")

# 2. CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Attach the router to the app
app.include_router(lgas.router)
app.include_router(cluster.router)
app.include_router(risk.router)

# 4. Health check
@app.get("/")
def read_root():
    return {"message": "API is running!"}