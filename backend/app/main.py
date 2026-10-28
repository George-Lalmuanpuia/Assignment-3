from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # NEW IMPORT

app = FastAPI(title="NSW LGA Road Risk API")

# NEW CORS CONFIGURATION
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, change "*" to ["http://localhost:3000"] or the React URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Hello World! The API is running."}