from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.enums import UserRole


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.DEVELOPER


class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[UserRole] = None


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    items: list[UserResponse]
    total: int
    page: int
    size: int
    pages: int
