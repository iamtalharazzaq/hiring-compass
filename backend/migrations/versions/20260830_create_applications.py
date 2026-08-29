"""create applications
Revision ID: 20260830_applications
Revises: 20260830_resumes
"""
from collections.abc import Sequence
import sqlalchemy as sa
from alembic import op
revision: str = "20260830_applications"; down_revision: str | Sequence[str] | None = "20260830_resumes"; branch_labels = None; depends_on = None
def upgrade() -> None:
    op.create_table("applications", sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("organization_id", sa.Uuid(), nullable=False), sa.Column("job_id", sa.Uuid(), nullable=False), sa.Column("candidate_id", sa.Uuid(), nullable=False), sa.Column("status", sa.String(20), nullable=False, server_default="new"), sa.Column("created_by_user_id", sa.Uuid(), nullable=False), sa.Column("status_changed_at", sa.DateTime(timezone=True), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False), sa.CheckConstraint("status IN ('new','shortlisted','on_hold','rejected')"), sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"]), sa.ForeignKeyConstraint(["job_id"], ["jobs.id"]), sa.ForeignKeyConstraint(["candidate_id"], ["candidates.id"]), sa.ForeignKeyConstraint(["created_by_user_id"], ["users.id"]), sa.UniqueConstraint("job_id", "candidate_id"))
    op.create_index("ix_applications_organization_id", "applications", ["organization_id"]); op.create_index("ix_applications_job_status", "applications", ["job_id", "status"]); op.create_index("ix_applications_candidate_created", "applications", ["candidate_id", "created_at"])
def downgrade() -> None: op.drop_table("applications")
