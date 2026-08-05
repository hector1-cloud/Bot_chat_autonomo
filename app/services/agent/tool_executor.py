from app.services.tools.types import ToolCall, ToolResult

class ToolExecutor:
    def __init__(self, registry):
        self.registry = registry

    def execute(self, tool_call: ToolCall) -> ToolResult:
        # Dummy implementation
        return ToolResult(
            tool_call_id=tool_call.name,
            name=tool_call.name,
            ok=True,
            data={"status": "executed"}
        )
