from __future__ import annotations

from dataclasses import dataclass, field
from uuid import UUID, uuid4


@dataclass
class RealtimeSession:
    session_id: UUID = field(default_factory=uuid4)
    user_id: UUID | None = None
    conversation_id: UUID | None = None
    mode: str = "voice"
    active: bool = True
    last_event: str = ""
    state: dict = field(default_factory=dict)


class RealtimeSessionManager:
    def __init__(self) -> None:
        self.sessions: dict[UUID, RealtimeSession] = {}

    def create_session(
        self,
        user_id: UUID,
        conversation_id: UUID | None = None,
        mode: str = "voice",
    ) -> RealtimeSession:
        session = RealtimeSession(
            user_id=user_id,
            conversation_id=conversation_id,
            mode=mode,
        )
        self.sessions[session.session_id] = session
        return session

    def get_session(self, session_id: UUID) -> RealtimeSession | None:
        return self.sessions.get(session_id)

    def close_session(self, session_id: UUID) -> None:
        session = self.sessions.get(session_id)
        if session is not None:
            session.active = False
            session.last_event = "closed"

    def update_state(self, session_id: UUID, **kwargs) -> RealtimeSession | None:
        session = self.sessions.get(session_id)
        if session is None:
            return None
        session.state.update(kwargs)
        return session
