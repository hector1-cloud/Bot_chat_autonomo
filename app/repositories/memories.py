from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.memory import Memory


def create_memory(
    db: Session,
    user_id: UUID,
    memory_type: str,
    summary: str,
    importance: float = 0.5,
    embedding: list[float] | None = None,
) -> Memory:
    memory = Memory(
        user_id=user_id,
        type=memory_type,
        summary=summary,
        importance=importance,
        embedding=embedding,
    )
    db.add(memory)
    db.flush()
    return memory


def list_recent_memories(db: Session, user_id: UUID, limit: int = 10) -> list[Memory]:
    stmt = (
        select(Memory)
        .where(Memory.user_id == user_id)
        .order_by(Memory.created_at.desc())
        .limit(limit)
    )
    return list(db.scalars(stmt).all())


def search_semantic_memories(
    db: Session,
    user_id: UUID,
    query_embedding: list[float],
    limit: int = 5,
) -> list[tuple[Memory, float]]:
    stmt = (
        select(Memory, Memory.embedding.cosine_distance(query_embedding).label("distance"))
        .where(Memory.user_id == user_id)
        .where(Memory.embedding.is_not(None))
        .order_by(Memory.embedding.cosine_distance(query_embedding).asc())
        .limit(limit)
    )
    return [(row[0], float(row[1])) for row in db.execute(stmt).all()]
