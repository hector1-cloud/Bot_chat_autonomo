from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.conversation import Conversation


def create_conversation(db: Session, user_id: UUID, title: str | None = None) -> Conversation:
    conversation = Conversation(user_id=user_id, title=title)
    db.add(conversation)
    db.flush()
    return conversation


def get_conversation(db: Session, conversation_id: UUID) -> Conversation | None:
    return db.get(Conversation, conversation_id)


def list_user_conversations(db: Session, user_id: UUID, limit: int = 20) -> list[Conversation]:
    stmt = (
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .order_by(Conversation.started_at.desc())
        .limit(limit)
    )
    return list(db.scalars(stmt).all())
