from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.db.database import get_db
from app.services.task_service import TaskService
from app.schemas.task import (
    TaskCreate, TaskUpdate, TaskAssign, TaskStatusUpdate,
    TaskResponse, TaskListResponse,
)
from app.models.enums import TaskStatus
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.post("", response_model=TaskResponse, status_code=201, summary="Create a new task")
def create_task(
    data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return TaskService(db).create_task(data, current_user)


@router.get("", response_model=TaskListResponse, summary="List tasks with optional filters")
def list_tasks(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    project_id: Optional[int] = Query(None),
    status: Optional[TaskStatus] = Query(None),
    assigned_to: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return TaskService(db).list_tasks(
        page=page, size=size,
        project_id=project_id, status=status, assigned_to=assigned_to,
    )


@router.get("/{task_id}", response_model=TaskResponse, summary="Get task by ID")
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return TaskService(db).get_task(task_id)


@router.patch("/{task_id}", response_model=TaskResponse, summary="Update a task")
def update_task(
    task_id: int,
    data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return TaskService(db).update_task(task_id, data, current_user)


@router.patch("/{task_id}/assign", response_model=TaskResponse, summary="Assign task to a user")
def assign_task(
    task_id: int,
    data: TaskAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return TaskService(db).assign_task(task_id, data, current_user)


@router.patch("/{task_id}/status", response_model=TaskResponse, summary="Update task status")
def update_status(
    task_id: int,
    data: TaskStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return TaskService(db).update_status(task_id, data, current_user)


@router.delete("/{task_id}", status_code=204, summary="Delete a task")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    TaskService(db).delete_task(task_id, current_user)
