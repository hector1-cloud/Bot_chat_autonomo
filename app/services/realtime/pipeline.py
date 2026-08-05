from __future__ import annotations

from uuid import UUID

from sqlalchemy.orm import Session

from app.services.agent.orchestrator import AgentOrchestrator
from app.services.avatar.animation import AvatarAnimationEngine
from app.services.realtime.media_layer import MediaLayer
from app.services.realtime.persistence import RealtimePersistenceService
from app.services.realtime.session_manager import RealtimeSession
from app.services.voice.streaming import VoiceSessionState, VoiceStreamingService


class RealtimePipeline:
    def __init__(self, db: Session):
        self.db = db
        self.persistence = RealtimePersistenceService(db)
        self.orchestrator = AgentOrchestrator(db)
        self.voice = VoiceStreamingService()
        self.avatar = AvatarAnimationEngine()
        self.media = MediaLayer()

    async def on_text(self, session: RealtimeSession, text: str) -> dict:
        self.persistence.log_event(
            session_id=session.session_id,
            user_id=session.user_id,
            event_type="TEXT_MESSAGE",
            payload=text,
        )

        reply = await self.orchestrator.handle_message(
            user_id=session.user_id,
            text=text,
            conversation_id=session.conversation_id,
        )
        session.conversation_id = reply.conversation_id

        avatar_frame = self.avatar.build_frame(
            text=reply.reply,
            emotion="curious" if reply.should_ask_followup else "neutral",
        )

        self.persistence.log_event(
            session_id=session.session_id,
            user_id=session.user_id,
            event_type="ASSISTANT_TURN",
            payload=reply.reply,
        )

        return {
            "type": "assistant_turn",
            "text": reply.reply,
            "followup_question": reply.followup_question,
            "should_ask_followup": reply.should_ask_followup,
            "conversation_id": str(reply.conversation_id),
            "avatar": avatar_frame,
        }

    async def on_audio_chunk(self, session: RealtimeSession, audio_chunk: bytes) -> dict:
        state = session.state.get("voice_state")
        if state is None:
            state = VoiceSessionState(
                user_id=session.user_id,
                conversation_id=session.conversation_id,
            )
            session.state["voice_state"] = state

        self.persistence.log_event(
            session_id=session.session_id,
            user_id=session.user_id,
            event_type="AUDIO_CHUNK",
            payload=f"{len(audio_chunk)} bytes",
        )

        result = await self.voice.handle_audio_chunk(
            state=state,
            audio_chunk=audio_chunk,
            orchestrator=self.orchestrator,
        )

        if result.get("type") == "assistant_turn":
            session.conversation_id = getattr(state, "conversation_id", session.conversation_id)
            session.state["last_transcript"] = result.get("transcript", "")
            session.state["last_reply"] = result.get("reply_text", "")
            session.state["avatar"] = self.avatar.build_frame(
                text=result["reply_text"],
                emotion="curious" if result["should_ask_followup"] else "neutral",
            )

            self.persistence.log_event(
                session_id=session.session_id,
                user_id=session.user_id,
                event_type="TRANSCRIPT_READY",
                payload=result.get("transcript", ""),
            )
            self.persistence.log_event(
                session_id=session.session_id,
                user_id=session.user_id,
                event_type="ASSISTANT_TURN",
                payload=result.get("reply_text", ""),
            )

        return result
