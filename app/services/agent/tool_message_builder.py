from __future__ import annotations

from app.services.agent.tool_specs import ToolSpec
from app.services.tools.types import ToolResult


class ToolMessageBuilder:
    def build_tool_context(self, tool_results: list[ToolResult]) -> str:
        if not tool_results:
            return "Sin resultados de herramientas."

        lines: list[str] = []
        for result in tool_results:
            if result.ok:
                lines.append(f"- {result.name}: {result.data}")
            else:
                lines.append(f"- {result.name}: ERROR {result.error}")
        return "\n".join(lines)

    def build_tool_specs_block(self, tool_specs: list[ToolSpec]) -> str:
        return "\n".join(
            f"{spec.name} :: {spec.description} :: {spec.arguments_schema}"
            for spec in tool_specs
        )
