from uuid import UUID
from sqlalchemy.orm import Session

from app.repositories.memories import create_memory, list_recent_memories, search_semantic_memories
from app.services.llm.embeddings import EmbeddingProvider


class MemoryManager:
    def __init__(self, db: Session, embedding_provider: EmbeddingProvider):
        self.db = db
        self.embedding_provider = embedding_provider

    async def save_episode(self, user_id: UUID, text: str, importance: float = 0.5):
        embedding = await self.embedding_provider.embed_text(text)
        return create_memory(
            self.db,
            user_id=user_id,
            memory_type="episodic",
            summary=text,
            importance=importance,
            embedding=embedding,
        )

    async def save_preference(self, user_id: UUID, text: str, importance: float = 0.7):
        embedding = await self.embedding_provider.embed_text(text)
        return create_memory(
            self.db,
            user_id=user_id,
            memory_type="preference",
            summary=text,
            importance=importance,
            embedding=embedding,
        )

    async def retrieve_relevant(self, user_id: UUID, query: str, limit: int = 5):
        query_embedding = await self.embedding_provider.embed_text(query)
        matches = search_semantic_memories(
            self.db, user_id=user_id, query_embedding=query_embedding, limit=limit
        )
        if matches:
            return matches
        recent = list_recent_memories(self.db, user_id=user_id, limit=limit)
        return [(m, None) for m in recent]
