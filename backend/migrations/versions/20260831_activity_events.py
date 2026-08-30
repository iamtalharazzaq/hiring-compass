"""add append-only activity events
Revision ID: 20260831_activity
Revises: 20260830_feedback
"""
from collections.abc import Sequence
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from alembic import op
revision: str = "20260831_activity"
down_revision: str | Sequence[str] | None = "20260830_feedback"
branch_labels = None
depends_on = None
def upgrade() -> None:
    op.create_table("activity_events", sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("organization_id", sa.Uuid(), nullable=False), sa.Column("actor_user_id", sa.Uuid()), sa.Column("event_type", sa.String(64), nullable=False), sa.Column("candidate_id", sa.Uuid()), sa.Column("job_id", sa.Uuid()), sa.Column("application_id", sa.Uuid()), sa.Column("interview_id", sa.Uuid()), sa.Column("entity_type", sa.String(32), nullable=False), sa.Column("entity_id", sa.Uuid(), nullable=False), sa.Column("metadata", postgresql.JSONB()), sa.Column("created_at", sa.DateTime(timezone=True), nullable=False), sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"]), sa.ForeignKeyConstraint(["actor_user_id"], ["users.id"]), sa.ForeignKeyConstraint(["candidate_id"], ["candidates.id"]), sa.ForeignKeyConstraint(["job_id"], ["jobs.id"]), sa.ForeignKeyConstraint(["application_id"], ["applications.id"]), sa.ForeignKeyConstraint(["interview_id"], ["interviews.id"]))
    for name, column in (("ix_activity_events_organization_id", "organization_id"), ("ix_activity_events_candidate_id", "candidate_id"), ("ix_activity_events_application_id", "application_id"), ("ix_activity_events_created_at", "created_at"), ("ix_activity_events_event_type", "event_type")):
        op.create_index(name, "activity_events", [column])
def downgrade() -> None:
    op.drop_table("activity_events")
