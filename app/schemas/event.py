from datetime import datetime
from pydantic import BaseModel, ConfigDict
from uuid import UUID


class EventCreate(BaseModel):
    user_id: UUID
    type: str
    payload: str


class EventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    type: str
    payload: str
    created_at: datetime
