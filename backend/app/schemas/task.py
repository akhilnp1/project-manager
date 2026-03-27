from pydantic import BaseModel,validator
from typing import Optional
from datetime import datetime, date
from app.models.enums import TaskStatus
from app.schemas.user import UserResponse




class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    project_id: int
    assigned_to: Optional[int] = None
    due_date: Optional[date] = None
    status: TaskStatus = TaskStatus.TODO

    @validator("status", pre=True)
    def normalize_status(cls, v):
        if isinstance(v, str):
            return v.lower()
        return v


class TaskAssign(BaseModel):
    assigned_to: int


class TaskStatusUpdate(BaseModel):
    status: TaskStatus


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assigned_to: Optional[int] = None
    due_date: Optional[date] = None
    status: Optional[TaskStatus] = None


class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: TaskStatus
    project_id: int
    assigned_to: Optional[int]
    due_date: Optional[date]
    created_at: datetime
    updated_at: datetime
    assignee: Optional[UserResponse] = None

    class Config:
        from_attributes = True


class TaskListResponse(BaseModel):
    items: list[TaskResponse]
    total: int
    page: int
    size: int
    pages: int
