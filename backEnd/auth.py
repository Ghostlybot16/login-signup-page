from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import os

from jose import jwt, JWTError
from passlib.context import CryptContext
from dotenv import load_dotenv

# Load .env 
load_dotenv()

# Config 
SECRET_KEY = os.getenv("AUTH_SECRET_KEY")
ALGORITHM = os.getenv("AUTH_ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("AUTH_ACCESS_MIN"))

# BCrypt hashing context 
_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Password helpers 
def hash_password(plain_password: str) -> str:
    """Return a bcrypt hash for a plain-text password"""
    return _pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against a bcrypt hash."""
    return _pwd_context.verify(plain_password, hashed_password)


# JWT Helpers 
def create_access_token(
    subject: str,
    expires_delta: Optional[timedelta] = None,
    extra_claims: Optional[Dict[str, Any]] = None,
) -> str:
    """
    Create a signed JWT. `subject` is a stable identifier (e.g., user email or id).
    `extra_claims` lets you add custom fields (e.g., roles).
    """
    to_encode: Dict[str, Any] = {"sub": subject}
    if extra_claims:
        to_encode.update(extra_claims)
    
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode["exp"] = expire

    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token 


def decode_access_token(token: str) -> Dict[str, Any]:
    """
    Decode a JWT and return its claims.
    Raises JWTError if the token is invalid or expired.
    """
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    return payload


def token_expiry(minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES) -> timedelta:
    """Helper to build a timedelta for custom expirations"""
    return timedelta(minutes=minutes)


# ---- Optional: quick self-test when run directly ----
if __name__ == "__main__":
    print("Running auth.py self-test…")
    pw = "ExamplePass123!"
    hashed = hash_password(pw)
    print(" Hashed:", hashed[:32] + "…")
    print(" Verify (correct):", verify_password(pw, hashed))
    print(" Verify (wrong):  ", verify_password("nope", hashed))

    tok = create_access_token(subject="user@example.com", extra_claims={"role": "user"})
    print(" JWT (prefix):", tok.split(".")[0] + ".…")
    try:
        claims = decode_access_token(tok)
        print(" Claims:", {k: claims[k] for k in ("sub", "role") if k in claims})
        print(" Exp:", claims.get("exp"))
        print("✅ Self-test OK")
    except JWTError as e:
        print("❌ JWT error:", e)

