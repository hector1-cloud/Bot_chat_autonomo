from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.agent.orchestrator import AgentOrchestrator

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest, db: Session = Depends(get_db)):
    orchestrator = AgentOrchestrator(db)
    result = await orchestrator.handle_message(
        user_id=payload.user_id,
        text=payload.text,
        conversation_id=payload.conversation_id,
    )
    db.commit()
    return result
