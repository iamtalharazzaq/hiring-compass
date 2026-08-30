"""create candidate communications
Revision ID: 20260831_communications
Revises: 20260831_decisions
"""
from collections.abc import Sequence
import sqlalchemy as sa
from alembic import op
revision: str = "20260831_communications"
down_revision: str | Sequence[str] | None = "20260831_decisions"
branch_labels = None
depends_on = None
def upgrade() -> None:
    op.create_table("candidate_communications", sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("organization_id", sa.Uuid(), nullable=False), sa.Column("application_id", sa.Uuid(), nullable=False), sa.Column("candidate_id", sa.Uuid(), nullable=False), sa.Column("job_id", sa.Uuid(), nullable=False), sa.Column("communication_type", sa.String(32), nullable=False), sa.Column("status", sa.String(24), nullable=False, server_default="draft"), sa.Column("recipient_email", sa.String(255), nullable=False), sa.Column("subject", sa.String(255), nullable=False), sa.Column("body", sa.Text(), nullable=False), sa.Column("created_by", sa.Uuid(), nullable=False), sa.Column("reviewed_by", sa.Uuid()), sa.Column("review_notes", sa.Text()), sa.Column("submitted_at", sa.DateTime(timezone=True)), sa.Column("reviewed_at", sa.DateTime(timezone=True)), sa.Column("ready_at", sa.DateTime(timezone=True)), sa.Column("created_at", sa.DateTime(timezone=True), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False), sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"]), sa.ForeignKeyConstraint(["application_id"], ["applications.id"]), sa.ForeignKeyConstraint(["candidate_id"], ["candidates.id"]), sa.ForeignKeyConstraint(["job_id"], ["jobs.id"]), sa.ForeignKeyConstraint(["created_by"], ["users.id"]), sa.ForeignKeyConstraint(["reviewed_by"], ["users.id"]), sa.CheckConstraint("communication_type IN ('interview_follow_up','next_steps','offer','rejection','hold')"), sa.CheckConstraint("status IN ('draft','pending_approval','returned','approved','ready_to_send','cancelled')"))
    op.create_index("ix_candidate_communications_org_application", "candidate_communications", ["organization_id", "application_id"])
def downgrade() -> None:
    op.drop_index("ix_candidate_communications_org_application", table_name="candidate_communications")
    op.drop_table("candidate_communications")
