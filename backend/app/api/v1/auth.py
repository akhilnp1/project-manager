from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.auth_service import AuthService
from app.schemas.auth import LoginRequest
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", summary="Login and get access token")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.login(data.email, data.password)


@router.get("/me", summary="Get current user profile")
def me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
    }
