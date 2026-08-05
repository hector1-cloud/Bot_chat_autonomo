import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Numeric, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class UserProfile(Base):
    __tablename__ = "user_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    curiosity: Mapped[float] = mapped_column(Numeric(3, 2), nullable=False, default=0.50)
    warmth: Mapped[float] = mapped_column(Numeric(3, 2), nullable=False, default=0.50)
    initiative: Mapped[float] = mapped_column(Numeric(3, 2), nullable=False, default=0.30)
    detail_level: Mapped[float] = mapped_column(Numeric(3, 2), nullable=False, default=0.50)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    user = relationship("User", back_populates="profile")
