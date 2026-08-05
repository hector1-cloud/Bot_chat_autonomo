from dataclasses import dataclass, field
from typing import Any

@dataclass
class ToolCall:
    name: str
    arguments: dict[str, Any]

@dataclass
class ToolResult:
    tool_call_id: str
    name: str
    ok: bool
    data: Any = None
    error: str | None = None

@dataclass
class AssistantDecision:
    final_text: str | None
    tool_calls: list[ToolCall] = field(default_factory=list)
    strategy: str = "direct"
