from __future__ import annotations

from app.schemas.realtime import RealtimeSignalIn, RealtimeSignalOut


class SignalingService:
    def handle_signal(self, signal: RealtimeSignalIn) -> RealtimeSignalOut:
        if signal.type == "offer":
            sdp = signal.payload.get("sdp", "")
            return RealtimeSignalOut(
                type="answer",
                payload={
                    "sdp": f"answer-for:{sdp}" if sdp else "answer-sdp-placeholder",
                    "accepted": True,
                },
            )

        if signal.type == "candidate":
            return RealtimeSignalOut(
                type="candidate_ack",
                payload={
                    "accepted": True,
                    "candidate_received": True,
                },
            )

        if signal.type == "bye":
            return RealtimeSignalOut(
                type="bye_ack",
                payload={"closed": True},
            )

        return RealtimeSignalOut(
            type="error",
            payload={
                "message": f"Signal desconocida: {signal.type}",
            },
        )
