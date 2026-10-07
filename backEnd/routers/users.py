from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from auth import (
    hash_password, 
    verify_password, 
    create_access_token, 
    token_expiry,
    get_current_user
)

router = APIRouter(
    prefix="/api/users", 
    tags=["Users"],
)



# Helpers 
def get_user_by_email(
    db: Session, 
    email: str,
) -> models.User | None:
    return (
        db.query(models.User)
        .filter(models.User.email == email)
        .first()
    )



# Routes 
@router.post(
    "/signup", 
    response_model=schemas.UserResponse, 
    status_code=status.HTTP_201_CREATED
)
def signup(
    payload: schemas.UserCreate, 
    db: Session = Depends(get_db)
):  
    normalized_email = payload.email.lower().strip()
    
    # Check if user exists
    existing = get_user_by_email(
        db, 
        normalized_email,
    )
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=(
                "An account with this email "
                "already exists."
            ),
        )
    
    # Hash and create new user 
    user = models.User(
        first_name=payload.first_name.strip(),
        last_name=payload.last_name.strip(),
        email=normalized_email,
        hashed_password=hash_password(
            payload.password
        ),
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user 



@router.post(
    "/login", 
    response_model=schemas.TokenResponse,
)
def login(
    payload: schemas.UserLogin, 
    db: Session = Depends(get_db),
):
    normalized_email = payload.email.lower().strip()
    
    user = get_user_by_email(
        db, 
        normalized_email,
    )
    
    if (
        not user 
        or not verify_password(
            payload.password, 
            user.hashed_password
        )
    ):
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                "Invalid credentials. "
                "Check email or password."
            ),
        )
    
    # Create JWT for authenticated requests
    access_token = create_access_token(
        subject=str(user.id),
        expires_delta=token_expiry(),
        extra_claims={
            "email": user.email
        },
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
    
    
@router.get(
    "/me",
    response_model=schemas.UserResponse,
)
def get_me(
    current_user: models.User = Depends(
        get_current_user
    ),
):
    return current_user