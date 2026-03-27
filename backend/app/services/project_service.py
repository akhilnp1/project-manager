import math
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.project_repository import ProjectRepository
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectListResponse, ProjectResponse
from app.models.user import User


class ProjectService:
    def __init__(self, db: Session):
        self.project_repo = ProjectRepository(db)

    def create_project(self, data: ProjectCreate, current_user: User) -> ProjectResponse:
        project = self.project_repo.create(
            name=data.name,
            description=data.description,
            created_by=current_user.id,
        )
        resp = ProjectResponse.model_validate(project)
        resp.task_count = self.project_repo.get_task_count(project.id)
        return resp

    def list_projects(self, page: int = 1, size: int = 10) -> ProjectListResponse:
        skip = (page - 1) * size
        projects, total = self.project_repo.get_all(skip=skip, limit=size)
        pages = math.ceil(total / size) if total > 0 else 0
        items = []
        for p in projects:
            r = ProjectResponse.model_validate(p)
            r.task_count = self.project_repo.get_task_count(p.id)
            items.append(r)
        return ProjectListResponse(items=items, total=total, page=page, size=size, pages=pages)

    def get_project(self, project_id: int) -> ProjectResponse:
        project = self.project_repo.get_by_id(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        resp = ProjectResponse.model_validate(project)
        resp.task_count = self.project_repo.get_task_count(project.id)
        return resp

    def update_project(self, project_id: int, data: ProjectUpdate, current_user: User) -> ProjectResponse:
        project = self.project_repo.get_by_id(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        from app.models.enums import UserRole
        if current_user.role != UserRole.ADMIN and project.created_by != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to update this project")
        updated = self.project_repo.update(project, **data.model_dump(exclude_none=True))
        resp = ProjectResponse.model_validate(updated)
        resp.task_count = self.project_repo.get_task_count(updated.id)
        return resp

    def delete_project(self, project_id: int, current_user: User) -> None:
        project = self.project_repo.get_by_id(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        from app.models.enums import UserRole
        if current_user.role != UserRole.ADMIN and project.created_by != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this project")
        self.project_repo.delete(project)
