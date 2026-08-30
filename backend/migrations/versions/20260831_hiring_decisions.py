"""add hiring decision approvals
Revision ID: 20260831_decisions
Revises: 20260831_activity
"""
from collections.abc import Sequence
import sqlalchemy as sa
from alembic import op
revision: str = "20260831_decisions"
down_revision: str | Sequence[str] | None = "20260831_activity"
branch_labels = None
depends_on = None
def upgrade() -> None:
    op.drop_constraint("applications_status_check", "applications", type_="check")
    op.create_check_constraint("applications_status_check", "applications", "status IN ('new','shortlisted','interviewing','decision_pending','offer_approved','on_hold','rejected')")
    op.create_table("hiring_decisions", sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("organization_id", sa.Uuid(), nullable=False), sa.Column("application_id", sa.Uuid(), nullable=False), sa.Column("proposed_outcome", sa.String(32), nullable=False), sa.Column("rationale", sa.Text(), nullable=False), sa.Column("status", sa.String(20), nullable=False), sa.Column("proposed_by", sa.Uuid(), nullable=False), sa.Column("submitted_at", sa.DateTime(timezone=True)), sa.Column("reviewed_by", sa.Uuid()), sa.Column("reviewed_at", sa.DateTime(timezone=True)), sa.Column("review_notes", sa.Text()), sa.Column("returned_at", sa.DateTime(timezone=True)), sa.Column("withdrawn_at", sa.DateTime(timezone=True)), sa.Column("created_at", sa.DateTime(timezone=True), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False), sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"]), sa.ForeignKeyConstraint(["application_id"], ["applications.id"]), sa.ForeignKeyConstraint(["proposed_by"], ["users.id"]), sa.ForeignKeyConstraint(["reviewed_by"], ["users.id"]), sa.CheckConstraint("proposed_outcome IN ('proceed_to_offer','reject','hold')"), sa.CheckConstraint("status IN ('draft','pending_approval','approved','returned','withdrawn')"))
    op.create_index("ix_hiring_decisions_org_application", "hiring_decisions", ["organization_id", "application_id"])
def downgrade() -> None:
    op.drop_table("hiring_decisions")
    op.drop_constraint("applications_status_check", "applications", type_="check")
    op.create_check_constraint("applications_status_check", "applications", "status IN ('new','shortlisted','interviewing','on_hold','rejected')")
