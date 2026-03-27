from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Date, Enum, func
from sqlalchemy.orm import relationship
from app.db.database import Base
from app.models.enums import TaskStatus


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    # status = Column(Enum(TaskStatus), default=TaskStatus.TODO, nullable=False)
    status = Column(
    Enum(TaskStatus, values_callable=lambda x: [e.value for e in x]),
    default=TaskStatus.TODO,
    nullable=False
)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    due_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    project = relationship("Project", back_populates="tasks")
    assignee = relationship("User", foreign_keys=[assigned_to])
