import math
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.task_repository import TaskRepository
from app.repositories.project_repository import ProjectRepository
from app.repositories.user_repository import UserRepository
from app.schemas.task import TaskCreate, TaskUpdate, TaskAssign, TaskStatusUpdate, TaskListResponse, TaskResponse
from app.models.enums import TaskStatus, UserRole
from app.models.user import User
from typing import Optional


class TaskService:
    def __init__(self, db: Session):
        self.task_repo = TaskRepository(db)
        self.project_repo = ProjectRepository(db)
        self.user_repo = UserRepository(db)

    def _validate_project(self, project_id: int):
        project = self.project_repo.get_by_id(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        return project

    def _validate_user(self, user_id: int):
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="Assigned user not found")
        return user

    def create_task(self, data: TaskCreate, current_user: User) -> TaskResponse:
        self._validate_project(data.project_id)
        if data.assigned_to:
            self._validate_user(data.assigned_to)
        task = self.task_repo.create(
            title=data.title,
            description=data.description,
            project_id=data.project_id,
            assigned_to=data.assigned_to,
            due_date=data.due_date,
            status=data.status.lower(),
        )
        return TaskResponse.model_validate(task)

    def list_tasks(
        self,
        page: int = 1,
        size: int = 10,
        project_id: Optional[int] = None,
        status: Optional[TaskStatus] = None,
        assigned_to: Optional[int] = None,
    ) -> TaskListResponse:
        skip = (page - 1) * size
        tasks, total = self.task_repo.get_all(
            skip=skip, limit=size,
            project_id=project_id, status=status, assigned_to=assigned_to,
        )
        pages = math.ceil(total / size) if total > 0 else 0
        return TaskListResponse(
            items=[TaskResponse.model_validate(t) for t in tasks],
            total=total, page=page, size=size, pages=pages,
        )

    def get_task(self, task_id: int) -> TaskResponse:
        task = self.task_repo.get_by_id(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return TaskResponse.model_validate(task)

    def assign_task(self, task_id: int, data: TaskAssign, current_user: User) -> TaskResponse:
        task = self.task_repo.get_by_id(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        self._validate_user(data.assigned_to)
        updated = self.task_repo.update(task, assigned_to=data.assigned_to)
        return TaskResponse.model_validate(updated)

    def update_status(self, task_id: int, data: TaskStatusUpdate, current_user: User) -> TaskResponse:
        task = self.task_repo.get_by_id(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        updated = self.task_repo.update(task, status=data.status)
        return TaskResponse.model_validate(updated)

    def update_task(self, task_id: int, data: TaskUpdate, current_user: User) -> TaskResponse:
        task = self.task_repo.get_by_id(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        if data.assigned_to is not None:
            self._validate_user(data.assigned_to)
        updated = self.task_repo.update(task, **data.model_dump(exclude_none=True))
        return TaskResponse.model_validate(updated)

    def delete_task(self, task_id: int, current_user: User) -> None:
        task = self.task_repo.get_by_id(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        if current_user.role != UserRole.ADMIN and task.project.created_by != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this task")
        self.task_repo.delete(task)
