"""create resumes

Revision ID: 20260830_resumes
Revises: 20260829_candidates
"""
from collections.abc import Sequence
import sqlalchemy as sa
from alembic import op

revision: str = "20260830_resumes"
down_revision: str | Sequence[str] | None = "20260829_candidates"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table("resumes",
        sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("organization_id", sa.Uuid(), nullable=False),
        sa.Column("candidate_id", sa.Uuid(), nullable=False), sa.Column("uploaded_by_user_id", sa.Uuid(), nullable=False),
        sa.Column("original_filename", sa.String(255), nullable=False), sa.Column("storage_key", sa.String(512), nullable=False, unique=True),
        sa.Column("content_type", sa.String(64), nullable=False), sa.Column("size_bytes", sa.Integer(), nullable=False),
        sa.Column("sha256", sa.String(64), nullable=False), sa.Column("is_current", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("content_type = 'application/pdf'"), sa.CheckConstraint("size_bytes > 0 AND size_bytes <= 10485760"),
        sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"]), sa.ForeignKeyConstraint(["candidate_id"], ["candidates.id"]), sa.ForeignKeyConstraint(["uploaded_by_user_id"], ["users.id"]))
    op.create_index("ix_resumes_organization_id", "resumes", ["organization_id"])
    op.create_index("ix_resumes_candidate_id", "resumes", ["candidate_id"])
    op.create_index("ix_resumes_candidate_current", "resumes", ["candidate_id", "is_current"])
    op.execute("CREATE UNIQUE INDEX ix_resumes_one_current ON resumes (candidate_id) WHERE is_current = true")

def downgrade() -> None:
    op.drop_table("resumes")
