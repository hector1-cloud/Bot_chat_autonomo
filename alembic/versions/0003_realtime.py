"""Add realtime sessions and events."""

from alembic import op
import sqlalchemy as sa

revision = "0003_realtime"
down_revision = "0002_events"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "realtime_sessions",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("conversation_id", sa.Uuid(), sa.ForeignKey("conversations.id", ondelete="SET NULL"), nullable=True),
        sa.Column("mode", sa.String(length=32), nullable=False, server_default="voice"),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="active"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_realtime_sessions_user_id", "realtime_sessions", ["user_id"])
    op.create_index("ix_realtime_sessions_conversation_id", "realtime_sessions", ["conversation_id"])

    op.create_table(
        "realtime_events",
        sa.Column("id", sa.Uuid(), primary_key=True, nullable=False),
        sa.Column("session_id", sa.Uuid(), sa.ForeignKey("realtime_sessions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("type", sa.String(length=64), nullable=False),
        sa.Column("payload", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_realtime_events_session_id", "realtime_events", ["session_id"])
    op.create_index("ix_realtime_events_user_id", "realtime_events", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_realtime_events_user_id", table_name="realtime_events")
    op.drop_index("ix_realtime_events_session_id", table_name="realtime_events")
    op.drop_table("realtime_events")

    op.drop_index("ix_realtime_sessions_conversation_id", table_name="realtime_sessions")
    op.drop_index("ix_realtime_sessions_user_id", table_name="realtime_sessions")
    op.drop_table("realtime_sessions")
