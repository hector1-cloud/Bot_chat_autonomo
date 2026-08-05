from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.message import Message


def create_message(db: Session, conversation_id: UUID, role: str, content: str) -> Message:
    message = Message(conversation_id=conversation_id, role=role, content=content)
    db.add(message)
    db.flush()
    return message


def list_conversation_messages(db: Session, conversation_id: UUID, limit: int = 100) -> list[Message]:
    stmt = (
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .limit(limit)
    )
    return list(db.scalars(stmt).all())
