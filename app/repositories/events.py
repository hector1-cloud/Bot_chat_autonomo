from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.event import Event


def create_event(db: Session, user_id: UUID, type: str, payload: str) -> Event:
    event = Event(user_id=user_id, type=type, payload=payload)
    db.add(event)
    db.flush()
    return event


def list_user_events(db: Session, user_id: UUID, limit: int = 50) -> list[Event]:
    stmt = (
        select(Event)
        .where(Event.user_id == user_id)
        .order_by(Event.created_at.desc())
        .limit(limit)
    )
    return list(db.scalars(stmt).all())
