from pydantic import BaseModel, EmailStr, Field
from datetime import datetime 

# Request models
class UserCreate(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password:  str = Field(min_length=8)


# Response models 
class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True


# Token response shape 
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"