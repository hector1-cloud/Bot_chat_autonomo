from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.constants import ROLE_ASSISTANT, ROLE_USER
from app.repositories.conversations import create_conversation, get_conversation
from app.repositories.messages import create_message
from app.repositories.users import get_or_create_user
from app.schemas.chat import ChatResponse, RetrievedMemory
from app.services.agent.cognitive_core import CognitiveCore
from app.services.agent.tool_executor import ToolExecutor
from app.services.agent.tool_loop import ToolLoop
from app.services.agent.tool_message_builder import ToolMessageBuilder
from app.services.llm.provider import LLMProvider
from app.services.tools.bootstrap import build_tool_registry
from app.services.tools.types import AssistantDecision


class AgentOrchestrator:
    def __init__(self, db: Session):
        self.db = db
        self.core = CognitiveCore(db)
        self.llm = LLMProvider()
        self.tools = ToolExecutor(build_tool_registry(db))
        self.tool_loop = ToolLoop(self.tools, max_steps=3)
        self.tool_message_builder = ToolMessageBuilder()

    async def _decide(self, user_id: UUID, text: str, context: str) -> AssistantDecision:
        system_prompt = (
            "Eres HECTRON. "
            "Puedes responder directamente o pedir herramientas cuando sea útil. "
            "Si necesitas memoria, perfil, eventos o reflexión, solicita herramientas explícitamente."
        )
        user_prompt = f"Usuario:{user_id}\nMensaje:{text}\nContexto:\n{context}"
        result = await self.llm.generate(system_prompt=system_prompt, user_prompt=user_prompt)
        return result.decision or AssistantDecision(final_text=result.text, strategy="direct")

    async def handle_message(
        self,
        user_id: UUID,
        text: str,
        conversation_id: UUID | None = None,
    ) -> ChatResponse:
        user = get_or_create_user(self.db, user_id=user_id)

        if conversation_id is None:
            conv = create_conversation(self.db, user_id=user.id, title=text[:60])
        else:
            conv = get_conversation(self.db, conversation_id)
            if conv is None:
                conv = create_conversation(self.db, user_id=user.id, title=text[:60])

        create_message(self.db, conversation_id=conv.id, role=ROLE_USER, content=text)

        memories = await self.core.memory_manager.retrieve_relevant(user.id, text, limit=5)
        memory_context = "\n".join(f"- {m.summary}" for m, _d in memories)

        profile_ctx = ""
        profile = None
        try:
            from app.repositories.profiles import get_profile
            profile = get_profile(self.db, user.id)
        except Exception:
            profile = None

        if profile is not None:
            profile_ctx = (
                f"curiosity={float(profile.curiosity)}; "
                f"warmth={float(profile.warmth)}; "
                f"initiative={float(profile.initiative)}; "
                f"detail_level={float(profile.detail_level)}"
            )

        decision = await self._decide(user.id, text, memory_context)

        if decision.tool_calls:
            loop_result = self.tool_loop.execute(decision, fallback_text=None)
            reply = loop_result.final_text
        else:
            reply = decision.final_text or await self.core.response_generator.generate(
                system_prompt="Eres HECTRON.",
                user_prompt=(
                    f"Mensaje del usuario: {text}\n"
                    f"Memoria:\n{memory_context or 'Sin recuerdos relevantes.'}\n"
                    f"Perfil:\n{profile_ctx or 'Sin perfil.'}"
                ),
            )

        create_message(self.db, conversation_id=conv.id, role=ROLE_ASSISTANT, content=reply)

        await self.core.memory_manager.save_episode(user.id, text=text, importance=0.6)

        if any(trigger in text.lower() for trigger in ["me gusta", "prefiero", "odio", "no me gusta"]):
            await self.core.memory_manager.save_preference(user.id, text=text, importance=0.8)

        self.db.commit()

        return ChatResponse(
            conversation_id=conv.id,
            reply=reply,
            should_ask_followup=decision.strategy in {"clarify", "tool_use"},
            followup_question="¿Quieres que lo deje guardado como memoria?" if "save_memory" in str(decision.tool_calls) else None,
            memories_used=[
                RetrievedMemory(
                    id=m.id,
                    type=m.type,
                    summary=m.summary,
                    importance=float(m.importance),
                    distance=distance,
                )
                for m, distance in memories
            ],
            generated_at=datetime.now(timezone.utc),
        )
