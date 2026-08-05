from datetime import datetime
from pydantic import BaseModel, ConfigDict
from uuid import UUID


class ProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: UUID
    curiosity: float
    warmth: float
    initiative: float
    detail_level: float
    updated_at: datetime
