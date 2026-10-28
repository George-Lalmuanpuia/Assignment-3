from fastapi import FastAPI

app = FastAPI(title="NSW LGA Road Risk API")

@app.get("/")
def read_root():
    return {"message": "Hello World! The API is running."}