from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.repositories.events import create_event, list_user_events
from app.schemas.event import EventCreate, EventOut

router = APIRouter()


@router.post("/events", response_model=EventOut)
async def create_event_endpoint(payload: EventCreate, db: Session = Depends(get_db)):
    event = create_event(
        db,
        user_id=payload.user_id,
        type=payload.type,
        payload=payload.payload,
    )
    db.commit()
    db.refresh(event)
    return event


@router.get("/users/{user_id}/events", response_model=list[EventOut])
async def read_events(user_id: str, limit: int = 50, db: Session = Depends(get_db)):
    return list_user_events(db, user_id=user_id, limit=limit)
