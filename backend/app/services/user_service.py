import math
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.user_repository import UserRepository
from app.core.security import get_password_hash
from app.schemas.user import UserCreate, UserUpdate, UserListResponse, UserResponse
from app.models.enums import UserRole


class UserService:
    def __init__(self, db: Session):
        self.user_repo = UserRepository(db)

    def create_user(self, data: UserCreate) -> UserResponse:
        existing = self.user_repo.get_by_email(data.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )
        hashed = get_password_hash(data.password)
        user = self.user_repo.create(
            name=data.name,
            email=data.email,
            hashed_password=hashed,
            role=data.role,
        )
        return UserResponse.model_validate(user)

    def list_users(self, page: int = 1, size: int = 10) -> UserListResponse:
        skip = (page - 1) * size
        users, total = self.user_repo.get_all(skip=skip, limit=size)
        pages = math.ceil(total / size) if total > 0 else 0
        return UserListResponse(
            items=[UserResponse.model_validate(u) for u in users],
            total=total,
            page=page,
            size=size,
            pages=pages,
        )

    def get_user(self, user_id: int) -> UserResponse:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return UserResponse.model_validate(user)

    def update_user(self, user_id: int, data: UserUpdate) -> UserResponse:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        updated = self.user_repo.update(user, **data.model_dump(exclude_none=True))
        return UserResponse.model_validate(updated)
