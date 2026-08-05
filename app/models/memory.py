import uuid
from datetime import datetime

from pgvector.sqlalchemy import Vector
from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text, func, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Memory(Base):
    __tablename__ = "memories"
    __table_args__ = (
        Index("ix_memories_user_type_created", "user_id", "type", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    type: Mapped[str] = mapped_column(String(32), nullable=False)  # semantic | episodic | preference | working
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    importance: Mapped[float] = mapped_column(Numeric(4, 2), nullable=False, default=0.50)
    embedding: Mapped[list[float] | None] = mapped_column(Vector(1536), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    user = relationship("User", back_populates="memories")
