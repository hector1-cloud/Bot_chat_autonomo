from dataclasses import dataclass
@dataclass
class Reasoning:
    strategy: str = "direct"
    followup_question: str | None = None
class Reasoner:
    def reason(self, user_text, memory_count, style_hint):
        return Reasoning()
