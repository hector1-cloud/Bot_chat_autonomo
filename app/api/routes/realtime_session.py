from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.repositories.realtime_events import list_realtime_events
from app.repositories.realtime_sessions import (
    close_realtime_session,
    get_realtime_session,
    list_user_realtime_sessions,
)

router = APIRouter()


@router.get("/realtime/sessions/{session_id}")
async def get_session(session_id: UUID, db: Session = Depends(get_db)):
    session = get_realtime_session(db, session_id)
    if session is None:
        return {"found": False}
    return {
        "found": True,
        "id": str(session.id),
        "user_id": str(session.user_id),
        "conversation_id": str(session.conversation_id) if session.conversation_id else None,
        "mode": session.mode,
        "status": session.status,
        "created_at": session.created_at,
        "updated_at": session.updated_at,
    }


@router.get("/realtime/users/{user_id}/sessions")
async def list_sessions(user_id: UUID, limit: int = 20, db: Session = Depends(get_db)):
    items = list_user_realtime_sessions(db, user_id=user_id, limit=limit)
    return [
        {
            "id": str(item.id),
            "conversation_id": str(item.conversation_id) if item.conversation_id else None,
            "mode": item.mode,
            "status": item.status,
            "created_at": item.created_at,
        }
        for item in items
    ]


@router.get("/realtime/sessions/{session_id}/events")
async def session_events(session_id: UUID, limit: int = 100, db: Session = Depends(get_db)):
    events = list_realtime_events(db, session_id=session_id, limit=limit)
    return [
        {
            "id": str(item.id),
            "session_id": str(item.session_id),
            "user_id": str(item.user_id),
            "type": item.type,
            "payload": item.payload,
            "created_at": item.created_at,
        }
        for item in events
    ]


@router.post("/realtime/sessions/{session_id}/close")
async def close_session(session_id: UUID, db: Session = Depends(get_db)):
    session = close_realtime_session(db, session_id=session_id)
    db.commit()
    if session is None:
        return {"closed": False}
    return {"closed": True, "session_id": str(session.id), "status": session.status}
