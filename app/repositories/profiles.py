from uuid import UUID

from sqlalchemy.orm import Session

from app.models.profile import UserProfile


def get_profile(db: Session, user_id: UUID) -> UserProfile | None:
    return db.get(UserProfile, user_id)


def upsert_profile(
    db: Session,
    user_id: UUID,
    curiosity: float | None = None,
    warmth: float | None = None,
    initiative: float | None = None,
    detail_level: float | None = None,
) -> UserProfile:
    profile = db.get(UserProfile, user_id)
    if profile is None:
        profile = UserProfile(user_id=user_id)
        db.add(profile)

    if curiosity is not None:
        profile.curiosity = curiosity
    if warmth is not None:
        profile.warmth = warmth
    if initiative is not None:
        profile.initiative = initiative
    if detail_level is not None:
        profile.detail_level = detail_level

    db.flush()
    return profile
