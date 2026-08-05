from __future__ import annotations

from uuid import UUID

from sqlalchemy.orm import Session

from app.repositories.events import create_event
from app.repositories.memories import list_recent_memories


class ReflectionEngine:
    def __init__(self, db: Session):
        self.db = db

    def reflect(self, user_id: UUID) -> str:
        memories = list_recent_memories(self.db, user_id=user_id, limit=10)
        if not memories:
            return "Sin suficiente contexto para reflexionar."

        top = memories[0].summary
        create_event(
            self.db,
            user_id=user_id,
            type="REFLECTION_DONE",
            payload=f"Resumen interno: {top}",
        )
        return f"Revisión completada sobre: {top}"
