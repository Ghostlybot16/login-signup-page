"""Pydantic schemas for user requests and API responses."""

from datetime import datetime 

from pydantic import (
    BaseModel, 
    ConfigDict,
    EmailStr, 
    Field,
)

# Request models
class UserCreate(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


# Response models 
class UserResponse(BaseModel):
    """
    Represent public user information returned by the API.
    """
    
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    created_at: datetime

# Token response shape 
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"