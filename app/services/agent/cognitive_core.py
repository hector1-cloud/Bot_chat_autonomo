from __future__ import annotations

from dataclasses import dataclass
from uuid import UUID

from sqlalchemy.orm import Session

from app.repositories.profiles import get_profile
from app.services.agent.context_builder import ContextBuilder
from app.services.agent.planner import Planner
from app.services.agent.reasoner import Reasoner
from app.services.agent.response_generator import ResponseGenerator
from app.services.llm.provider import LLMProvider
from app.services.llm.embeddings import EmbeddingProvider
from app.services.memory.memory_manager import MemoryManager


@dataclass
class CognitiveOutput:
    reply: str
    should_ask_followup: bool
    followup_question: str | None
    strategy: str


class CognitiveCore:
    def __init__(self, db: Session):
        self.db = db
        self.embedding_provider = EmbeddingProvider()
        self.memory_manager = MemoryManager(db, self.embedding_provider)
        self.context_builder = ContextBuilder()
        self.reasoner = Reasoner()
        self.planner = Planner()
        self.llm = LLMProvider()
        self.response_generator = ResponseGenerator(self.llm)

    async def process(self, user_id: UUID, text: str) -> CognitiveOutput:
        memories = await self.memory_manager.retrieve_relevant(user_id=user_id, query=text, limit=5)
        profile = get_profile(self.db, user_id)

        profile_dict = None
        if profile is not None:
            profile_dict = {
                "curiosity": float(profile.curiosity),
                "warmth": float(profile.warmth),
                "initiative": float(profile.initiative),
                "detail_level": float(profile.detail_level),
            }

        built = self.context_builder.build(
            user_id=user_id,
            user_text=text,
            memories=memories,
            profile=profile_dict,
        )

        plan = self.planner.plan(user_text=text, memories=memories)
        reasoning = self.reasoner.reason(
            user_text=text,
            memory_count=len(memories),
            style_hint=plan.style,
        )

        system_prompt = self.llm.prompt_builder.build_system_prompt(
            built.system_prompt,
            self.llm.tool_specs,
        )
        user_prompt = built.user_prompt + f"\n\nEstrategia sugerida: {reasoning.strategy}"

        llm_result = await self.response_generator.generate(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
        )

        followup = reasoning.followup_question
        if followup is None and plan.should_ask_followup:
            followup = plan.followup_question

        return CognitiveOutput(
            reply=llm_result,
            should_ask_followup=bool(followup),
            followup_question=followup,
            strategy=reasoning.strategy,
        )
