from uuid import UUID
from sqlalchemy.orm import Session

class RealtimePersistenceService:
    def __init__(self, db: Session):
        self.db = db

    def log_event(self, session_id: UUID, user_id: UUID, event_type: str, payload: str):
        pass

    def start_session(self, user_id: UUID, conversation_id: UUID | None, mode: str):
        pass

    def end_session(self, session_id: UUID):
        pass
