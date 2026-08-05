from pydantic import BaseModel
from typing import Any, Dict, Optional
from uuid import UUID

class RealtimeSignalIn(BaseModel):
    type: str
    payload: Dict[str, Any]

class RealtimeSignalOut(BaseModel):
    type: str
    payload: Dict[str, Any]

class RealtimeSessionStart(BaseModel):
    user_id: UUID
    conversation_id: Optional[UUID] = None
    mode: str = "voice"
