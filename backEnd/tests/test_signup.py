from turtle import st

import pytest 

from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

from auth import verify_password
from models import User


def test_signup_success(
    client: TestClient, 
    user_payload: dict[str, str]
) -> None:
    response = client.post(
        "/api/users/signup",
        json=user_payload,
    )
    
    assert response.status_code == 201
    
    data = response.json()
    
    assert data["id"] > 0
    assert data["first_name"] == "Monkey"
    assert data["last_name"] == "Luffy"
    assert data["email"] == "luffy@example.com"
    assert data["created_at"] is not None

    # Passwords must not appear in API responses.
    assert "password" not in data
    assert "hashed_password" not in data


def test_signup_normalizes_user_data(
    client: TestClient,
    user_payload: dict[str, str],
) -> None:
    payload = {
        **user_payload,
        "first_name": "  Monkey  ",
        "last_name": "  Luffy  ",
        "email": "LUFFY@EXAMPLE.COM",
    }
    
    response = client.post(
        "/api/users/signup",
        json=payload,
    )
    
    assert response.status_code == 201
    
    data = response.json()
    
    assert data["first_name"] == "Monkey"
    assert data["last_name"] == "Luffy"
    assert data["email"] == "luffy@example.com"


def test_signup_password_is_hashed(
    client: TestClient,
    test_engine: Engine,
    user_payload: dict[str, str],
) -> None:
    response = client.post(
        "/api/users/signup",
        json=user_payload,
    )
    
    assert response.status_code == 201
    
    with Session(test_engine) as db:
        user = db.scalar(
            select(User).where(
                User.email == "luffy@example.com"
            )
        )
        
        assert user is not None

        assert (
            user.hashed_password
            != user_payload["password"]
        )
        
        assert verify_password(
            user_payload["password"],
            user.hashed_password,
        )


def test_signup_duplicate_email(
    client: TestClient,
    registered_user: dict[str, object],
) -> None:
    payload = {
        "first_name": "Monkey",
        "last_name": "Luffy",
        "email": "LUFFY@EXAMPLE.COM",
        "password": "OnePiece123!",
    }
    
    response = client.post(
        "/api/users/signup",
        json=payload,
    )
    
    assert response.status_code == 400
    
    assert "already exists" in (
        response.json()["detail"].lower()
    )


@pytest.mark.parametrize(
    "invalid_fields",
    [
        {"email": "invalid-email"},
        {"password": "short"},
        {"first_name": "M" * 101},
        {"last_name": ""},
    ],
)
def test_signup_invalid_data(
    client: TestClient,
    user_payload: dict[str, str],
    invalid_fields: dict[str, str],
) -> None:
    payload = {
        **user_payload,
        **invalid_fields,
    }
    
    response = client.post(
        "/api/users/signup",
        json=payload,
    )
    
    assert response.status_code == 422