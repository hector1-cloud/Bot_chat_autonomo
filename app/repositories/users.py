from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.profile import UserProfile


def get_or_create_user(db: Session, user_id: UUID, name: str | None = None) -> User:
    user = db.get(User, user_id)
    if user is None:
        user = User(id=user_id, name=name)
        db.add(user)
        db.flush()

        profile = UserProfile(user_id=user.id)
        db.add(profile)
        db.flush()

    return user
