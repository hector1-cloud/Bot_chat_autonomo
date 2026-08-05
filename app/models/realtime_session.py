from app.db.base import Base
from sqlalchemy.orm import Mapped, mapped_column
import uuid

class RealtimeSession(Base):
    __tablename__ = "realtime_sessions"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
