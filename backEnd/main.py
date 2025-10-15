from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine
from . import models

app = FastAPI(title="Signup/Login Backend")

# Allow front end requests 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root route
@app.get("/")
def root():
    return {"message": "Backend is running successfully!"} 

print("Database engine connected:", engine)