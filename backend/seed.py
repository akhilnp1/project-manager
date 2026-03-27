"""
Seed script: creates default admin and developer users.
Run: python seed.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal
from app.models.user import User
from app.models.enums import UserRole
from app.core.security import get_password_hash


def seed():
    db = SessionLocal()
    try:
        # Check if admin already exists
        existing = db.query(User).filter(User.email == "admin@example.com").first()
        if existing:
            print("Seed data already exists. Skipping.")
            return

        admin = User(
            name="Admin User",
            email="admin@example.com",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.ADMIN,
        )
        dev = User(
            name="Dev User",
            email="dev@example.com",
            hashed_password=get_password_hash("dev123"),
            role=UserRole.DEVELOPER,
        )
        db.add_all([admin, dev])
        db.commit()
        print("✅ Seed complete!")
        print("   Admin:     admin@example.com / admin123")
        print("   Developer: dev@example.com   / dev123")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
