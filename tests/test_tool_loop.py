from __future__ import annotations

from app.services.agent.tool_loop import ToolLoop
from app.services.agent.tool_executor import ToolExecutor
from app.services.tools.registry import ToolRegistry
from app.services.tools.types import AssistantDecision, ToolCall


class DummyTool:
    name = "dummy"

    def run(self, **kwargs):
        return {"echo": kwargs}


def test_tool_loop_executes_tool_calls():
    registry = ToolRegistry()
    registry.register(DummyTool())
    executor = ToolExecutor(registry)

    loop = ToolLoop(executor, max_steps=2)
    decision = AssistantDecision(
        strategy="tool_use",
        tool_calls=[ToolCall(name="dummy", arguments={"x": 1})],
        final_text=None,
    )

    result = loop.execute(decision)
    assert "Usé herramientas" in result.final_text
    assert len(result.steps) == 1
