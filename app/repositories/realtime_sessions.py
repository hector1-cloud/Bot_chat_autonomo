from uuid import UUID
from sqlalchemy.orm import Session

def get_realtime_session(db: Session, session_id: UUID):
    return None

def list_user_realtime_sessions(db: Session, user_id: UUID, limit: int = 20) -> list:
    return []

def close_realtime_session(db: Session, session_id: UUID):
    return None
