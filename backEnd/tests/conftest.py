import os 
import sys 

from collections.abc import Iterator
from pathlib import Path
from typing import Any

# Make the existing backend modules importable.
BACKEND_DIR = Path(__file__).resolve().parents[1]

sys.path.insert(0, str(BACKEND_DIR))

# Set isolated test configuration BEFORE importing 
# application modules. 
#
# The application's original engine will use
# an in-memory SQLite URL, not development users.db
os.environ["SQLALCHEMY_DATABASE_URL"] = "sqlite://"

os.environ["AUTH_SECRET_KEY"] = (
    "automated-testing-only-secret-not-for-production"
)

os.environ["AUTH_ALGORITHM"] = "HS256"
os.environ["AUTH_ACCESS_MIN"] = "30"



import pytest 
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

import main

from database import get_db

@pytest.fixture
def test_engine(tmp_path: Path) -> Iterator[Engine]:
    """
    Create an isolated temporary SQLite database
    for each test.
    """
    database_path = tmp_path / "auth_test.db"
    
    engine = create_engine(
        f"sqlite:///{database_path}",
        connect_args={
            "check_same_thread": False
        },
    )
    
    try:
        yield engine
        
    finally:
        engine.dispose()


@pytest.fixture
def client(
    test_engine: Engine, 
    monkeypatch: pytest.MonkeyPatch,
) -> Iterator[TestClient]:
    """
    Provide a FastAPI test client connected to 
    the isolated test database.
    
    Override both:
    1. The database session dependency.
    2. The engine used during application startup.
    """
    testing_session = sessionmaker(
        autocommit=False,
        autoflush=False,
        expire_on_commit=False,
        bind=test_engine,
    )
    
    def override_get_db() -> Iterator[Session]:
        with testing_session() as db:
            yield db
    
    # Prevent the lifespan function
    # from initializing the development database.
    monkeypatch.setattr(
        main,
        "engine",
        test_engine,
    )
    
    # All endpoints using Depends(get_db) now receive
    # sessions from the test database.
    main.app.dependency_overrides[get_db] = (
        override_get_db
    )
    
    try:
        # Entering the context runs the lifespan
        # startup and shutdown functions.
        with TestClient(main.app) as test_client:
            yield test_client
            
    finally:
        main.app.dependency_overrides.clear()


@pytest.fixture
def user_payload() -> dict[str, str]:
    """Reusable registration information."""
    return {
        "first_name": "Monkey",
        "last_name": "Luffy",
        "email": "luffy@example.com",
        "password": "OnePiece123!",
    }


@pytest.fixture
def registered_user(
    client: TestClient, 
    user_payload: dict[str, str],
) -> dict[str, Any]:
    """
    Register a user and return the account
    information for subsequent tests.
    """
    response = client.post(
        "/api/users/signup",
        json=user_payload,
    )
    
    assert response.status_code == 201, response.text
    
    return {
        "credentials": user_payload,
        "user" : response.json(),
    }