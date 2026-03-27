from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.user import UserResponse


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    created_by: int
    created_at: datetime
    updated_at: datetime
    creator: Optional[UserResponse] = None
    task_count: Optional[int] = 0

    class Config:
        from_attributes = True


class ProjectListResponse(BaseModel):
    items: list[ProjectResponse]
    total: int
    page: int
    size: int
    pages: int
