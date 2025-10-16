from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models
from .. import schemas
from ..auth import hash_password, verify_password, create_access_token, token_expiry

router = APIRouter(prefix="/api/users", tags=["Users"])

# Helpers 
def get_user_by_email(db: Session, email: str) -> models.User | None:
    return db.query(models.User).filter(models.User.email == email).first()

# Routes 
@router.post("/signup", 
    response_model=schemas.UserResponse, 
    status_code=status.HTTP_201_CREATED
)
def signup(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    
    # Check if user exists
    existing = get_user_by_email(db, payload.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="An account with this email already exists."
        )
    
    
    # Hash and create new user 
    user = models.User(
        first_name=payload.first_name.strip(),
        last_name=payload.last_name.strip(),
        email=payload.email.lower().strip(),
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user 



@router.post("/login", response_model=schemas.TokenResponse)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    
    user = get_user_by_email(db, payload.email.lower().strip())
    
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Check email or password."
        )
    
    # Create JWT to use to login
    access_token = create_access_token(
        subject=str(user.id),
        expires_delta=token_expiry(),
        extra_claims={"email": user.email},
    )
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }