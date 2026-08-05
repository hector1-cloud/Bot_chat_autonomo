from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID


class MemoryCreate(BaseModel):
    user_id: UUID
    type: str = Field(pattern="^(semantic|episodic|preference|working)$")
    summary: str
    importance: float = 0.5
    embedding: list[float] | None = None


class MemoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    user_id: UUID
    type: str
    summary: str
    importance: float
    created_at: datetime
