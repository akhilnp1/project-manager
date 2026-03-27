from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import Optional, Tuple, List
from app.models.task import Task
from app.models.enums import TaskStatus


class TaskRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, task_id: int) -> Optional[Task]:
        return (
            self.db.query(Task)
            .options(joinedload(Task.assignee))
            .filter(Task.id == task_id)
            .first()
        )

    def get_all(
        self,
        skip: int = 0,
        limit: int = 10,
        project_id: Optional[int] = None,
        status: Optional[TaskStatus] = None,
        assigned_to: Optional[int] = None,
    ) -> Tuple[List[Task], int]:
        query = self.db.query(Task).options(joinedload(Task.assignee))

        if project_id is not None:
            query = query.filter(Task.project_id == project_id)
        if status is not None:
            query = query.filter(Task.status == status)
        if assigned_to is not None:
            query = query.filter(Task.assigned_to == assigned_to)

        count_query = self.db.query(func.count(Task.id))
        if project_id is not None:
            count_query = count_query.filter(Task.project_id == project_id)
        if status is not None:
            count_query = count_query.filter(Task.status == status)
        if assigned_to is not None:
            count_query = count_query.filter(Task.assigned_to == assigned_to)

        total = count_query.scalar()
        tasks = query.order_by(Task.created_at.desc()).offset(skip).limit(limit).all()
        return tasks, total

    def create(
        self,
        title: str,
        description: Optional[str],
        project_id: int,
        assigned_to: Optional[int],
        due_date,
        status: TaskStatus = TaskStatus.TODO,
    ) -> Task:
        task = Task(
            title=title,
            description=description,
            project_id=project_id,
            assigned_to=assigned_to,
            due_date=due_date,
            status=status.lower(),
        )
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return self.get_by_id(task.id)

    def update(self, task: Task, **kwargs) -> Task:
        for key, value in kwargs.items():
            setattr(task, key, value)
        self.db.commit()
        self.db.refresh(task)
        return self.get_by_id(task.id)

    def delete(self, task: Task) -> None:
        self.db.delete(task)
        self.db.commit()
