from __future__ import annotations

from app.services.agent.tool_specs import ToolSpec


class PromptBuilder:
    def build_system_prompt(self, base_prompt: str, tool_specs: list[ToolSpec]) -> str:
        tool_block = "\n".join(
            f"- {spec.name}: {spec.description}\n  schema: {spec.arguments_schema}"
            for spec in tool_specs
        )

        return (
            base_prompt.strip()
            + "\n\n"
            + "Herramientas disponibles:\n"
            + tool_block
            + "\n\n"
            + "Instrucciones de uso de herramientas:\n"
            + "- Usa una herramienta solo si aporta información nueva o ejecuta una acción necesaria.\n"
            + "- Si necesitas memoria, usa search_memory.\n"
            + "- Si necesitas guardar un hecho persistente, usa save_memory.\n"
            + "- Si necesitas cambiar perfil, usa update_profile.\n"
            + "- Si necesitas registrar un evento, usa emit_event.\n"
            + "- Si necesitas reflexión, usa trigger_reflection.\n"
            + "- Si no hace falta herramienta, responde directamente.\n"
            + "- Si llamas herramientas, devuelve una decisión estructurada.\n"
        )

    def build_user_prompt(
        self,
        *,
        user_id: str,
        user_text: str,
        memory_context: str,
        profile_context: str,
        conversation_context: str = "",
    ) -> str:
        parts = [
            f"user_id: {user_id}",
            f"mensaje_usuario: {user_text}",
            "",
            "contexto_memoria:",
            memory_context or "Sin recuerdos relevantes.",
            "",
            "contexto_perfil:",
            profile_context or "Sin perfil cargado.",
        ]

        if conversation_context:
            parts.extend(["", "contexto_conversacion:", conversation_context])

        parts.extend(
            [
                "",
                "Responde en español.",
                "Si necesitas herramientas, devuelve una decisión estructurada con tool_calls.",
            ]
        )

        return "\n".join(parts)
