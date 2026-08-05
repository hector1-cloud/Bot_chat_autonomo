from __future__ import annotations

import json
from typing import Any

from app.services.tools.types import AssistantDecision, ToolCall


class DecisionParser:
    def parse(self, raw_text: str) -> AssistantDecision:
        text = (raw_text or "").strip()

        if not text:
            return AssistantDecision(final_text=None, tool_calls=[], strategy="direct")

        try:
            data = json.loads(text)
        except json.JSONDecodeError:
            return AssistantDecision(final_text=text, tool_calls=[], strategy="direct")

        if not isinstance(data, dict):
            return AssistantDecision(final_text=text, tool_calls=[], strategy="direct")

        tool_calls: list[ToolCall] = []
        for item in data.get("tool_calls", []) or []:
            if not isinstance(item, dict):
                continue
            name = item.get("name")
            arguments = item.get("arguments", {})
            if isinstance(name, str) and isinstance(arguments, dict):
                tool_calls.append(ToolCall(name=name, arguments=arguments))

        final_text = data.get("final_text")
        strategy = data.get("strategy", "direct")

        return AssistantDecision(
            final_text=final_text if isinstance(final_text, str) else None,
            tool_calls=tool_calls,
            strategy=strategy if strategy in {"direct", "supportive", "clarify", "tool_use"} else "direct",
        )
