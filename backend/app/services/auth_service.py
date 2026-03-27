from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.user_repository import UserRepository
from app.core.security import verify_password, create_access_token
from app.schemas.auth import Token


class AuthService:
    def __init__(self, db: Session):
        self.user_repo = UserRepository(db)

    def login(self, email: str, password: str) -> dict:
        user = self.user_repo.get_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        token = create_access_token(data={"sub": str(user.id)})
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
            },
        }
