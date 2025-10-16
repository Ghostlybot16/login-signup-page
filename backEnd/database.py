import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Base directory to ensure DB outputs stay inside /backEnd 
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Read the database URL from .env
db_url = os.getenv("SQLALCHEMY_DATABASE_URL", "sqlite:///./users.db")

if db_url.startswith("sqlite:///") and not db_url.startswith("sqlite.////"):
    rel_path = db_url.replace("sqlite:///", "", 1)
    abs_path = os.path.join(BASE_DIR, rel_path)
    db_url = f"sqlite:///{abs_path}"

connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {}

# Engine + Session setup
engine = create_engine(
    db_url, connect_args=connect_args
)

SessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine
)

# Base class for models 
Base = declarative_base()

# Dependency helper 
def get_db():
    """FastAPI dependency: provides a DB session and closes it after request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()