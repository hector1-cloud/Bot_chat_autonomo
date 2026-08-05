from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.services.tools.bootstrap import build_tool_registry

router = APIRouter(prefix="/debug", tags=["debug"])


@router.get("/tools")
async def list_tools(db: Session = Depends(get_db)):
    registry = build_tool_registry(db)
    return {"tools": registry.list_names()}
