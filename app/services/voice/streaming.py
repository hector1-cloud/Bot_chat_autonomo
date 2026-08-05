from dataclasses import dataclass
from uuid import UUID
from typing import Any

@dataclass
class VoiceSessionState:
    user_id: UUID
    conversation_id: UUID | None

class VoiceStreamingService:
    async def handle_audio_chunk(self, state: VoiceSessionState, audio_chunk: bytes, orchestrator: Any) -> dict:
        return {"type": "ack"}
