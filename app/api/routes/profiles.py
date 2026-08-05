from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.repositories.profiles import get_profile, upsert_profile
from app.schemas.profile import ProfileOut

router = APIRouter()


@router.get("/users/{user_id}/profile", response_model=ProfileOut)
async def read_profile(user_id: UUID, db: Session = Depends(get_db)):
    profile = get_profile(db, user_id)
    if profile is None:
        profile = upsert_profile(db, user_id=user_id)
        db.commit()
        db.refresh(profile)
    return profile


@router.patch("/users/{user_id}/profile", response_model=ProfileOut)
async def update_profile(
    user_id: UUID,
    curiosity: float | None = None,
    warmth: float | None = None,
    initiative: float | None = None,
    detail_level: float | None = None,
    db: Session = Depends(get_db),
):
    profile = upsert_profile(
        db,
        user_id=user_id,
        curiosity=curiosity,
        warmth=warmth,
        initiative=initiative,
        detail_level=detail_level,
    )
    db.commit()
    db.refresh(profile)
    return profile
