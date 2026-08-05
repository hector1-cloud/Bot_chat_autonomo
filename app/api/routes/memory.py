from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.repositories.memories import create_memory as create_memory_repo, list_recent_memories
from app.schemas.memory import MemoryCreate, MemoryOut

router = APIRouter()


@router.post("/memories", response_model=MemoryOut)
async def create_memory_endpoint(payload: MemoryCreate, db: Session = Depends(get_db)):
    memory = create_memory_repo(
        db,
        user_id=payload.user_id,
        memory_type=payload.type,
        summary=payload.summary,
        importance=payload.importance,
        embedding=payload.embedding,
    )
    db.commit()
    db.refresh(memory)
    return memory


@router.get("/users/{user_id}/memories", response_model=list[MemoryOut])
async def list_memories(user_id: str, limit: int = 20, db: Session = Depends(get_db)):
    return list_recent_memories(db, user_id=user_id, limit=limit)
