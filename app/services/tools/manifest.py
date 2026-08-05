from __future__ import annotations

from app.services.agent.tool_specs import ToolSpec


def default_tool_specs() -> list[ToolSpec]:
    return [
        ToolSpec(
            name="search_memory",
            description="Busca recuerdos relevantes del usuario por similitud semántica o recientes.",
            arguments_schema='{"user_id":"str","query":"str","limit":"int"}',
        ),
        ToolSpec(
            name="save_memory",
            description="Guarda un recuerdo persistente del usuario.",
            arguments_schema='{"user_id":"str","summary":"str","memory_type":"episodic|semantic|preference|working","importance":"float"}',
        ),
        ToolSpec(
            name="update_profile",
            description="Actualiza rasgos persistentes del perfil del usuario.",
            arguments_schema='{"user_id":"str","curiosity":"float?","warmth":"float?","initiative":"float?","detail_level":"float?"}',
        ),
        ToolSpec(
            name="emit_event",
            description="Registra un evento interno del sistema.",
            arguments_schema='{"user_id":"str","event_type":"str","payload":"str"}',
        ),
        ToolSpec(
            name="trigger_reflection",
            description="Dispara una reflexión sobre la conversación o el estado interno.",
            arguments_schema='{"user_id":"str"}',
        ),
        ToolSpec(
            name="create_livekit_token",
            description="Genera un token de LiveKit para una sala.",
            arguments_schema='{"user_id":"str","room":"str","display_name":"str?"}',
        ),
    ]
