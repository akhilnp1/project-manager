from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.project_service import ProjectService
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectListResponse
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post("", response_model=ProjectResponse, status_code=201, summary="Create a new project")
def create_project(
    data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ProjectService(db).create_project(data, current_user)


@router.get("", response_model=ProjectListResponse, summary="List all projects")
def list_projects(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return ProjectService(db).list_projects(page=page, size=size)


@router.get("/{project_id}", response_model=ProjectResponse, summary="Get project by ID")
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return ProjectService(db).get_project(project_id)


@router.patch("/{project_id}", response_model=ProjectResponse, summary="Update a project")
def update_project(
    project_id: int,
    data: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ProjectService(db).update_project(project_id, data, current_user)


@router.delete("/{project_id}", status_code=204, summary="Delete a project")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ProjectService(db).delete_project(project_id, current_user)
