"""add email delivery attempts
Revision ID: 20260831_email_deliveries
Revises: 20260831_communications
"""
from collections.abc import Sequence
import sqlalchemy as sa
from alembic import op
revision: str = "20260831_email_deliveries"
down_revision: str | Sequence[str] | None = "20260831_communications"
branch_labels = None
depends_on = None
def upgrade() -> None:
    op.drop_constraint("candidate_communications_status_check", "candidate_communications", type_="check")
    op.create_check_constraint("candidate_communications_status_check", "candidate_communications", "status IN ('draft','pending_approval','returned','approved','ready_to_send','sent','cancelled')")
    op.create_table("email_deliveries", sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("organization_id", sa.Uuid(), nullable=False), sa.Column("communication_id", sa.Uuid(), nullable=False), sa.Column("recipient_email", sa.String(255), nullable=False), sa.Column("subject_snapshot", sa.String(255), nullable=False), sa.Column("body_snapshot", sa.Text(), nullable=False), sa.Column("status", sa.String(16), nullable=False), sa.Column("attempt_count", sa.Integer(), nullable=False, server_default="0"), sa.Column("provider_message_id", sa.String(255)), sa.Column("last_error_code", sa.String(64)), sa.Column("last_error_message", sa.String(500)), sa.Column("sent_at", sa.DateTime(timezone=True)), sa.Column("failed_at", sa.DateTime(timezone=True)), sa.Column("created_by", sa.Uuid(), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False), sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"]), sa.ForeignKeyConstraint(["communication_id"], ["candidate_communications.id"]), sa.ForeignKeyConstraint(["created_by"], ["users.id"]), sa.CheckConstraint("status IN ('pending','sending','sent','failed')"))
    op.create_index("ix_email_deliveries_communication", "email_deliveries", ["communication_id"])
def downgrade() -> None:
    op.drop_index("ix_email_deliveries_communication", table_name="email_deliveries"); op.drop_table("email_deliveries")
    op.drop_constraint("candidate_communications_status_check", "candidate_communications", type_="check")
    op.create_check_constraint("candidate_communications_status_check", "candidate_communications", "status IN ('draft','pending_approval','returned','approved','ready_to_send','cancelled')")
