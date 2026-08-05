from __future__ import annotations

from dataclasses import dataclass
import json

from app.services.agent.decision_parser import DecisionParser
from app.services.agent.tool_specs import ToolSpec
from app.services.tools.manifest import default_tool_specs


@dataclass
class LLMResult:
    text: str
    decision: object | None = None


class LLMProvider:
    def __init__(self) -> None:
        self.parser = DecisionParser()
        self.tool_specs: list[ToolSpec] = default_tool_specs()

    async def generate(self, system_prompt: str, user_prompt: str) -> LLMResult:
        """
        Hook para proveedor real.
        El MVP mantiene una política simple basada en texto, pero deja listo
        el contrato para que el modelo devuelva JSON estructurado.
        """
        lower = user_prompt.lower()

        if "guarda esto" in lower or "recuerda esto" in lower or "guardar" in lower:
            raw = {
                "strategy": "tool_use",
                "tool_calls": [
                    {
                        "name": "save_memory",
                        "arguments": {
                            "user_id": "00000000-0000-0000-0000-000000000001",
                            "summary": lower[:500],
                            "memory_type": "episodic",
                            "importance": 0.8,
                        },
                    }
                ],
                "final_text": None,
            }
            raw_text = json.dumps(raw)
            return LLMResult(text=raw_text, decision=self.parser.parse(raw_text))

        if "recuerd" in lower or "memoria" in lower:
            raw = {
                "strategy": "tool_use",
                "tool_calls": [
                    {
                        "name": "search_memory",
                        "arguments": {
                            "user_id": "00000000-0000-0000-0000-000000000001",
                            "query": lower[:500],
                            "limit": 5,
                        },
                    }
                ],
                "final_text": None,
            }
            raw_text = json.dumps(raw)
            return LLMResult(text=raw_text, decision=self.parser.parse(raw_text))

        if "perfil" in lower or "ajusta" in lower:
            raw = {
                "strategy": "tool_use",
                "tool_calls": [
                    {
                        "name": "update_profile",
                        "arguments": {
                            "user_id": "00000000-0000-0000-0000-000000000001",
                            "curiosity": 0.65,
                            "initiative": 0.45,
                        },
                    }
                ],
                "final_text": None,
            }
            raw_text = json.dumps(raw)
            return LLMResult(text=raw_text, decision=self.parser.parse(raw_text))

        return LLMResult(text=f"[stub] {user_prompt[:240]}")
