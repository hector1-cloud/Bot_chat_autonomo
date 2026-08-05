from __future__ import annotations

from dataclasses import dataclass, field

from app.services.agent.tool_executor import ToolExecutor
from app.services.tools.types import AssistantDecision, ToolCall, ToolResult


@dataclass
class ToolLoopStep:
    decision: AssistantDecision
    tool_results: list[ToolResult] = field(default_factory=list)
    assistant_text: str | None = None


@dataclass
class ToolLoopResult:
    final_text: str
    steps: list[ToolLoopStep] = field(default_factory=list)


class ToolLoop:
    def __init__(self, executor: ToolExecutor, max_steps: int = 3) -> None:
        self.executor = executor
        self.max_steps = max_steps

    def execute(self, initial_decision: AssistantDecision, fallback_text: str | None = None) -> ToolLoopResult:
        steps: list[ToolLoopStep] = []
        current = initial_decision
        final_text = fallback_text or current.final_text or ""

        for _ in range(self.max_steps):
            step = ToolLoopStep(decision=current)

            if not current.tool_calls:
                if current.final_text:
                    final_text = current.final_text
                    step.assistant_text = current.final_text
                steps.append(step)
                break

            tool_outputs: list[str] = []
            for tool_call in current.tool_calls[:5]:
                result = self.executor.execute(tool_call)
                step.tool_results.append(result)

                if result.ok:
                    tool_outputs.append(f"{tool_call.name}: {result.data}")
                else:
                    tool_outputs.append(f"{tool_call.name} ERROR: {result.error}")

            steps.append(step)

            merged = "\n".join(tool_outputs).strip()
            if merged:
                final_text = f"Usé herramientas y obtuve:\n{merged}"
            else:
                final_text = current.final_text or final_text

            break

        return ToolLoopResult(final_text=final_text, steps=steps)
