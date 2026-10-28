from datetime import timedelta
from ssl import create_default_context
from typing import Any

from fastapi.testclient import TestClient

from auth import create_access_token


def test_current_user_with_valid_token(
    client: TestClient,
    registered_user: dict[str, Any],
) -> None:
    credentials = registered_user["credentials"]
    user = registered_user["user"]
    
    login_response = client.post(
        "/api/users/login",
        json={
            "email": credentials["email"],
            "password": credentials["password"],
        },
    )
    
    assert login_response.status_code == 200
    
    token = login_response.json()["access_token"]
    
    response = client.get(
        "/api/users/me",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )
    
    assert response.status_code == 200
    
    data = response.json()
    
    assert data["id"] == user["id"]
    assert data["first_name"] == "Monkey"
    assert data["last_name"] == "Luffy"
    assert data["email"] == "luffy@example.com"
    
    assert "hashed_password" not in data


def test_current_user_without_token(
    client: TestClient,
) -> None:
    response = client.get("/api/users/me")
    
    assert response.status_code == 401


def test_current_user_invalid_token(
    client: TestClient,
) -> None:
    response = client.get(
        "/api/users/me",
        headers={
            "Authorization": "Bearer invalid.jwt.token",
        },
    )
    
    assert response.status_code == 401
    
    
def test_current_user_expired_token(
    client: TestClient,
    registered_user: dict[str, Any],
) -> None:
    user = registered_user["user"]
    
    expired_token = create_access_token(
        subject=str(user["id"]),
        expires_delta=timedelta(minutes=-1),
    )
    
    response = client.get(
        "/api/users/me",
        headers={
            "Authorization": f"Bearer {expired_token}",
        },
    )
    
    assert response.status_code == 401


def test_current_user_nonexistent_account(
    client: TestClient,
) -> None:
    token = create_access_token(
        subject="9999999",
    )
    
    response = client.get(
        "/api/users/me",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )
    
    assert response.status_code == 401


def test_current_user_invalid_subject(
    client: TestClient,
) -> None:
    token = create_access_token(
        subject="not-an-integer",
    )
    
    response = client.get(
        "/api/users/me",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )
    
    assert response.status_code == 401