from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.user_service import UserService
from app.schemas.user import UserCreate, UserUpdate, UserResponse, UserListResponse
from app.core.dependencies import get_current_user, require_admin
from app.models.user import User

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("", response_model=UserResponse, status_code=201, summary="Create a new user (Admin only)")
def create_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return UserService(db).create_user(data)


@router.get("", response_model=UserListResponse, summary="List all users")
def list_users(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return UserService(db).list_users(page=page, size=size)


@router.get("/{user_id}", response_model=UserResponse, summary="Get user by ID")
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return UserService(db).get_user(user_id)


@router.patch("/{user_id}", response_model=UserResponse, summary="Update user (Admin only)")
def update_user(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return UserService(db).update_user(user_id, data)
