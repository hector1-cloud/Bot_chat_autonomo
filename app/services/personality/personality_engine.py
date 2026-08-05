from __future__ import annotations

from uuid import UUID

from sqlalchemy.orm import Session

from app.repositories.profiles import get_profile, upsert_profile
from app.services.personality.traits import PersonalityTraits


class PersonalityEngine:
    def __init__(self, db: Session):
        self.db = db

    def get_traits(self, user_id: UUID) -> PersonalityTraits:
        profile = get_profile(self.db, user_id)
        if profile is None:
            profile = upsert_profile(self.db, user_id=user_id)

        return PersonalityTraits(
            curiosity=float(profile.curiosity),
            warmth=float(profile.warmth),
            initiative=float(profile.initiative),
            detail_level=float(profile.detail_level),
        )

    def adapt_after_message(self, user_id: UUID, user_text: str) -> None:
        text = user_text.lower()

        curiosity_delta = 0.0
        initiative_delta = 0.0

        if any(k in text for k in ["quiero", "proyecto", "idea", "ayúdame"]):
            curiosity_delta += 0.02
            initiative_delta += 0.01

        if any(k in text for k in ["no me gusta", "odio", "molesta", "frustrado"]):
            initiative_delta -= 0.01

        profile = upsert_profile(self.db, user_id=user_id)

        profile.curiosity = min(1.0, max(0.0, float(profile.curiosity) + curiosity_delta))
        profile.initiative = min(1.0, max(0.0, float(profile.initiative) + initiative_delta))
        self.db.flush()
