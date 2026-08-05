from __future__ import annotations

import base64
import json
from uuid import UUID

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.db.session import SessionLocal
from app.schemas.realtime import RealtimeSignalIn, RealtimeSessionStart
from app.services.realtime.persistence import RealtimePersistenceService
from app.services.realtime.pipeline import RealtimePipeline
from app.services.realtime.session_manager import RealtimeSessionManager
from app.services.realtime.signaling import SignalingService

router = APIRouter()

sessions = RealtimeSessionManager()
signaling = SignalingService()


@router.websocket("/ws/realtime/{user_id}")
async def realtime_socket(websocket: WebSocket, user_id: UUID):
    await websocket.accept()

    db = SessionLocal()
    pipeline = RealtimePipeline(db)
    persistence = RealtimePersistenceService(db)

    session = sessions.create_session(user_id=user_id, mode="voice")
    persistence.start_session(user_id=user_id, conversation_id=None, mode="voice")

    try:
        await websocket.send_text(
            json.dumps(
                {
                    "type": "session_started",
                    "payload": {
                        "session_id": str(session.session_id),
                        "user_id": str(session.user_id),
                        "conversation_id": str(session.conversation_id) if session.conversation_id else None,
                        "mode": session.mode,
                    },
                }
            )
        )

        await websocket.send_text(
            json.dumps(
                {
                    "type": "media_ready",
                    "payload": {
                        "audio": True,
                        "video": True,
                        "data_channel": True,
                    },
                }
            )
        )

        while True:
            message = await websocket.receive()

            if message.get("text") is not None:
                data = json.loads(message["text"])

                if data.get("type") == "start":
                    start = RealtimeSessionStart(**data.get("payload", {}))
                    session.user_id = start.user_id
                    session.conversation_id = start.conversation_id
                    session.mode = start.mode

                    persistence.log_event(
                        session_id=session.session_id,
                        user_id=session.user_id,
                        event_type="SESSION_STARTED",
                        payload=json.dumps(
                            {
                                "conversation_id": str(start.conversation_id) if start.conversation_id else None,
                                "mode": start.mode,
                            }
                        ),
                    )

                    await websocket.send_text(
                        json.dumps(
                            {
                                "type": "ready",
                                "payload": {
                                    "session_id": str(session.session_id),
                                    "mode": session.mode,
                                },
                            }
                        )
                    )
                    continue

                if data.get("type") in {"offer", "candidate", "bye"}:
                    signal = RealtimeSignalIn(type=data["type"], payload=data.get("payload", {}))
                    response = signaling.handle_signal(signal)
                    await websocket.send_text(json.dumps(response.model_dump()))
                    continue

                if data.get("type") == "text_message":
                    result = await pipeline.on_text(session, data.get("text", ""))
                    await websocket.send_text(json.dumps(result))
                    continue

                if data.get("type") == "ping":
                    await websocket.send_text(json.dumps({"type": "pong"}))
                    continue

                await websocket.send_text(
                    json.dumps(
                        {
                            "type": "error",
                            "payload": {"message": "mensaje no soportado"},
                        }
                    )
                )
                continue

            if message.get("bytes") is not None:
                result = await pipeline.on_audio_chunk(session, message["bytes"])

                if result.get("type") == "assistant_turn":
                    await websocket.send_text(
                        json.dumps(
                            {
                                "type": "assistant_turn",
                                "transcript": result["transcript"],
                                "reply_text": result["reply_text"],
                                "should_ask_followup": result["should_ask_followup"],
                                "followup_question": result["followup_question"],
                                "conversation_id": result["conversation_id"],
                                "audio_mime_type": result["audio_mime_type"],
                                "audio_b64": base64.b64encode(result["audio_bytes"]).decode("utf-8"),
                                "avatar": session.state.get("avatar"),
                            }
                        )
                    )
                else:
                    await websocket.send_text(json.dumps(result))

    except WebSocketDisconnect:
        persistence.end_session(session.session_id)
        sessions.close_session(session.session_id)
        db.close()
