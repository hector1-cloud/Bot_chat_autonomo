from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.core.security import create_access_token
from app.repositories.users import get_or_create_user

router = APIRouter()


class LoginRequest(BaseModel):
    user_id: UUID
    name: str | None = Field(default=None, max_length=255)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/auth/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = get_or_create_user(db, user_id=payload.user_id, name=payload.name)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se pudo iniciar sesión",
        )

    token = create_access_token(subject=str(user.id), extra={"name": user.name})
    db.commit()
    return TokenResponse(access_token=token)
