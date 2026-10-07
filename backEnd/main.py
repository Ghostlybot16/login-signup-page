from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine
import models
from routers import users

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Initializing database tables...")
    models.Base.metadata.create_all(bind=engine)
    
    yield

    print("Shutting down application...")

app = FastAPI(
    title="Signup/Login Backend",
    lifespan=lifespan
)

# Allow front end requests 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root route
@app.get("/")
def root():
    return {"message": "Backend is running successfully!"} 

app.include_router(users.router)

print("Database engine connected:", engine)