from typing import Any

from fastapi.testclient import TestClient

from auth import decode_access_token


def test_login_success(
    client: TestClient,
    registered_user: dict[str, Any],
) -> None:
    credentials = registered_user["credentials"]
    user = registered_user["user"]
    
    response = client.post(
        "/api/users/login",
        json={
            "email": credentials["email"],
            "password": credentials["password"],
        },
    )
    
    assert response.status_code == 200
    
    data = response.json()
    
    assert data["token_type"] == "bearer"
    assert isinstance(data["access_token"], str)
    assert data["access_token"]
    
    claims = decode_access_token(
        data["access_token"]
    )
    
    assert claims["sub"] == str(user["id"])
    assert claims["email"] == user["email"]
    assert "exp" in claims


def test_login_case_insensitive_email(
    client: TestClient,
    registered_user: dict[str, Any],
) -> None:
    credentials = registered_user["credentials"]
    
    response = client.post(
        "/api/users/login",
        json={
            "email": "LUFFY@EXAMPLE.COM",
            "password": credentials["password"],
        },
    )
    
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_wrong_password(
    client: TestClient,
    registered_user: dict[str, Any],
) -> None:
    credentials = registered_user["credentials"]
    
    response = client.post(
        "/api/users/login",
        json={
            "email": credentials["email"],
            "password": "WrongPassword123!",
        },
    )
    
    assert response.status_code == 401
    assert "access_token" not in response.json()


def test_login_unknown_account(
    client: TestClient,
) -> None:
    response = client.post(
        "/api/users/login",
        json={
            "email": "unknown@example.com",
            "password": "OnePiece123!",
        },
    )
    
    assert response.status_code == 401
    assert "access_token" not in response.json()