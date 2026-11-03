
"""
Launch an isolated FastAPI backend for Playwright tests.

This module provides a separate backend environment
for end-to-end browser testing.

Features:
    - Uses an in-memory SQLite database.
    - Uses a test-only JWT signing secret.
    - Overrides FastAPI's database dependency.
    - Prevents modifications to development users.db.
    - Starts the test server at 127.0.0.1:8001.

The database exists only while this server is running.
"""

import os
import sys

from collections.abc import Iterator
from pathlib import Path

# Locate the backend directory independently.
#
# e2e_server.py is located at:
# backEnd/tests/e2e_server.py
#
# parents[1] therefore resolves to backEnd/.
BACKEND_DIR: Path = Path(__file__).resolve().parents[1]

# Make backend modules importable regardless of
# the directory from which this script is launched.
sys.path.insert(0, str(BACKEND_DIR))

# Configure the test environment BEFORE importing
# application modules such as main and database.
#
# This ensures the application's original engine
# does not connect to the development database.
os.environ["SQLALCHEMY_DATABASE_URL"] = "sqlite://"

os.environ["AUTH_SECRET_KEY"] = (
    "playwright-testing-only-secret-not-for-production"
)

os.environ["AUTH_ALGORITHM"] = "HS256"
os.environ["AUTH_ACCESS_MIN"] = "30"


import uvicorn

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

import main

from database import get_db


# Create a shared in-memory SQLite database.
#
# StaticPool maintains one database connection
# so all request-handling threads access the
# same in-memory database.
test_engine: Engine = create_engine(
    "sqlite://",
    connect_args={
        "check_same_thread": False,
    },
    poolclass=StaticPool,
)

# Create sessions bound exclusively to the
# Playwright testing database.
TestSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
    bind=test_engine,
)


def override_get_db() -> Iterator[Session]:
    """
    Provide an isolated database session.

    Yields:
        Session: A SQLAlchemy session connected
        to the in-memory testing database.

    The session closes automatically after
    FastAPI finishes handling the request.
    """
    with TestSessionLocal() as db:
        yield db


# Replace the application startup engine.
#
# The lifespan function in main.py uses
# main.engine when creating database tables.
# Replacing it ensures tables are created
# in the isolated testing database.
main.engine = test_engine

# Override FastAPI's database dependency.
#
# This affects the signup, login, and
# protected current-user endpoints.
main.app.dependency_overrides[get_db] = (
    override_get_db
)


if __name__ == "__main__":
    # Launch the isolated FastAPI application.
    #
    # Playwright manages this process and
    # stops it when browser tests finish.
    uvicorn.run(
        main.app,
        host="127.0.0.1",
        port=8001,
    )
