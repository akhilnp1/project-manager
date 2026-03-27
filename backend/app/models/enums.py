import enum


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    DEVELOPER = "developer"


class TaskStatus(str, enum.Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    IN_REVIEW = "in_review"
    DONE = "done"
