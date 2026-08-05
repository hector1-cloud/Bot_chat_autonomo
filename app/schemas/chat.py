from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID


class ChatRequest(BaseModel):
    user_id: UUID
    conversation_id: UUID | None = None
    text: str = Field(min_length=1, max_length=8000)


class RetrievedMemory(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    type: str
    summary: str
    importance: float
    distance: float | None = None


class ChatResponse(BaseModel):
    conversation_id: UUID
    reply: str
    should_ask_followup: bool = False
    followup_question: str | None = None
    memories_used: list[RetrievedMemory] = []
    generated_at: datetime
