from uuid import UUID
from sqlalchemy.orm import Session

def list_realtime_events(db: Session, session_id: UUID, limit: int = 100) -> list:
    return []
