from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, Tuple, List
from app.models.user import User
from app.models.enums import UserRole


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def get_all(self, skip: int = 0, limit: int = 10) -> Tuple[List[User], int]:
        query = self.db.query(User)
        total = query.count()
        users = query.offset(skip).limit(limit).all()
        return users, total

    def create(self, name: str, email: str, hashed_password: str, role: UserRole) -> User:
        user = User(name=name, email=email, hashed_password=hashed_password, role=role)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update(self, user: User, **kwargs) -> User:
        for key, value in kwargs.items():
            if value is not None:
                setattr(user, key, value)
        self.db.commit()
        self.db.refresh(user)
        return user

    def delete(self, user: User) -> None:
        self.db.delete(user)
        self.db.commit()
