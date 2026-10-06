import os
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent

load_dotenv(BASE_DIR / ".env")

# Read the database URL from .env
db_url = os.getenv(
    "SQLALCHEMY_DATABASE_URL", 
    "sqlite:///./users.db",
)

if (
    db_url.startswith("sqlite:///") 
    and not db_url.startswith("sqlite.////")
):
    rel_path = db_url.replace(
        "sqlite:///", 
        "", 
        1,
    )
    
    abs_path = BASE_DIR / rel_path
    db_url = f"sqlite:///{abs_path}"

connect_args = (
    {"check_same_thread": False} 
    if db_url.startswith("sqlite") 
    else {}
)

# Engine + Session setup
engine = create_engine(
    db_url, 
    connect_args=connect_args,
)

SessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False,
    expire_on_commit=False,
    bind=engine
)

# Base class for models 
Base = declarative_base()

# Dependency helper 
def get_db():
    """ 
    Provide a database session for a FastAPI request 
    and close it afterwards.
    """
    db = SessionLocal()
    
    try:
        yield db
    finally:
        db.close()