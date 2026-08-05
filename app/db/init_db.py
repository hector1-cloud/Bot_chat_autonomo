from sqlalchemy import text

from app.db.base import Base
from app.db.session import engine

from app.models.conversation import Conversation  # noqa: F401
from app.models.event import Event  # noqa: F401
from app.models.memory import Memory  # noqa: F401
from app.models.message import Message  # noqa: F401
from app.models.profile import UserProfile  # noqa: F401
from app.models.realtime_event import RealtimeEvent  # noqa: F401
from app.models.realtime_session import RealtimeSession  # noqa: F401
from app.models.user import User  # noqa: F401


def init_db() -> None:
    with engine.begin() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        Base.metadata.create_all(bind=conn)
