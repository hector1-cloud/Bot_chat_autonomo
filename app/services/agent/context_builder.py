from __future__ import annotations

from dataclasses import dataclass
from typing import Any
from uuid import UUID

from app.models.memory import Memory


@dataclass
class BuiltContext:
    system_prompt: str
    user_prompt: str
    memory_summaries: list[str]
    raw_memories: list[Memory]
    profile_context: str
    conversation_context: str


class ContextBuilder:
    def build(
        self,
        user_id: UUID,
        user_text: str,
        memories: list[tuple[Memory, float | None]],
        profile: dict[str, Any] | None = None,
        conversation_snippet: str = "",
    ) -> BuiltContext:
        memory_summaries = [m.summary for m, _distance in memories[:5]]

        system_prompt = (
            "Eres HECTRON, un agente conversacional persistente con memoria, "
            "curiosidad controlada y tono claro en español. "
            "No inventes recuerdos. Si faltan datos, pregunta con precisión. "
            "Si el usuario parece confundido, prioriza claridad y apoyo."
        )

        profile_context = ""
        if profile:
            profile_context = (
                f"curiosity={profile.get('curiosity', 0.5)}; "
                f"warmth={profile.get('warmth', 0.5)}; "
                f"initiative={profile.get('initiative', 0.3)}; "
                f"detail_level={profile.get('detail_level', 0.5)}"
            )

        if memory_summaries:
            memory_block = "\n".join(f"- {m}" for m in memory_summaries)
        else:
            memory_block = "Sin recuerdos relevantes."

        user_prompt = (
            f"UserID: {user_id}\n"
            f"Mensaje actual:\n{user_text}\n\n"
            f"Memoria relevante:\n{memory_block}\n\n"
            f"Perfil:\n{profile_context or 'Sin perfil.'}\n\n"
            f"Fragmento conversación:\n{conversation_snippet or 'N/A'}\n\n"
            "Genera una respuesta útil, natural y consistente con el contexto."
        )

        return BuiltContext(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            memory_summaries=memory_summaries,
            raw_memories=[m for m, _distance in memories],
            profile_context=profile_context,
            conversation_context=conversation_snippet,
        )
