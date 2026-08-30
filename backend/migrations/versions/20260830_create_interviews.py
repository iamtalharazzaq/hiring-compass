"""create interview stages and interviews
Revision ID: 20260830_interviews
Revises: 20260830_applications
"""
from collections.abc import Sequence
import sqlalchemy as sa
from alembic import op
revision: str = "20260830_interviews"; down_revision: str | Sequence[str] | None = "20260830_applications"; branch_labels = None; depends_on = None
def upgrade() -> None:
    op.drop_constraint("applications_status_check", "applications", type_="check")
    op.create_check_constraint("applications_status_check", "applications", "status IN ('new','shortlisted','interviewing','on_hold','rejected')")
    op.create_table("interview_stages", sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("organization_id", sa.Uuid(), nullable=False), sa.Column("job_id", sa.Uuid(), nullable=False), sa.Column("name", sa.String(160), nullable=False), sa.Column("description", sa.Text()), sa.Column("position", sa.Integer(), nullable=False), sa.Column("duration_minutes", sa.Integer()), sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()), sa.Column("created_at", sa.DateTime(timezone=True), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False), sa.CheckConstraint("char_length(name) > 0"), sa.CheckConstraint("position > 0"), sa.CheckConstraint("duration_minutes IS NULL OR duration_minutes > 0"), sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"]), sa.ForeignKeyConstraint(["job_id"], ["jobs.id"]), sa.UniqueConstraint("job_id", "position"))
    op.create_index("ix_interview_stages_organization_id", "interview_stages", ["organization_id"])
    op.create_table("interviews", sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("organization_id", sa.Uuid(), nullable=False), sa.Column("application_id", sa.Uuid(), nullable=False), sa.Column("interview_stage_id", sa.Uuid(), nullable=False), sa.Column("scheduled_at", sa.DateTime(timezone=True), nullable=False), sa.Column("duration_minutes", sa.Integer(), nullable=False), sa.Column("location_or_meeting_details", sa.Text()), sa.Column("status", sa.String(16), nullable=False, server_default="scheduled"), sa.Column("cancelled_reason", sa.Text()), sa.Column("created_by", sa.Uuid(), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False), sa.CheckConstraint("status IN ('scheduled','cancelled')"), sa.CheckConstraint("duration_minutes > 0"), sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"]), sa.ForeignKeyConstraint(["application_id"], ["applications.id"]), sa.ForeignKeyConstraint(["interview_stage_id"], ["interview_stages.id"]), sa.ForeignKeyConstraint(["created_by"], ["users.id"]))
    op.create_index("ix_interviews_organization_scheduled", "interviews", ["organization_id", "scheduled_at"]); op.create_index("ix_interviews_application_id", "interviews", ["application_id"])
def downgrade() -> None:
    op.drop_table("interviews"); op.drop_table("interview_stages"); op.drop_constraint("applications_status_check", "applications", type_="check"); op.create_check_constraint("applications_status_check", "applications", "status IN ('new','shortlisted','on_hold','rejected')")
