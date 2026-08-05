from dataclasses import dataclass
@dataclass
class Plan:
    style: str = "direct"
    should_ask_followup: bool = False
    followup_question: str | None = None
class Planner:
    def plan(self, user_text, memories):
        return Plan()
