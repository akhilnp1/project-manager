from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import Optional, Tuple, List
from app.models.project import Project
from app.models.task import Task


class ProjectRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, project_id: int) -> Optional[Project]:
        return (
            self.db.query(Project)
            .options(joinedload(Project.creator))
            .filter(Project.id == project_id)
            .first()
        )

    def get_all(self, skip: int = 0, limit: int = 10) -> Tuple[List[Project], int]:
        query = self.db.query(Project).options(joinedload(Project.creator))
        total = self.db.query(func.count(Project.id)).scalar()
        projects = query.order_by(Project.created_at.desc()).offset(skip).limit(limit).all()
        return projects, total

    def get_task_count(self, project_id: int) -> int:
        return self.db.query(func.count(Task.id)).filter(Task.project_id == project_id).scalar()

    def create(self, name: str, description: Optional[str], created_by: int) -> Project:
        project = Project(name=name, description=description, created_by=created_by)
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        return self.get_by_id(project.id)

    def update(self, project: Project, **kwargs) -> Project:
        for key, value in kwargs.items():
            if value is not None:
                setattr(project, key, value)
        self.db.commit()
        self.db.refresh(project)
        return project

    def delete(self, project: Project) -> None:
        self.db.delete(project)
        self.db.commit()
