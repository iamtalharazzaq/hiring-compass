"""add job requirements and jd review fields

Revision ID: 20260829_job_requirements
Revises: 20260829_jobs
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260829_job_requirements"
down_revision: str | Sequence[str] | None = "20260829_jobs"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("jobs", sa.Column("submitted_for_approval_at", sa.DateTime(timezone=True)))
    op.add_column("jobs", sa.Column("approved_at", sa.DateTime(timezone=True)))
    op.add_column("jobs", sa.Column("approved_by_user_id", sa.Uuid()))
    op.add_column("jobs", sa.Column("review_note", sa.Text()))
    op.create_check_constraint(
        "ck_jobs_review_note_length", "jobs", "review_note IS NULL OR char_length(review_note) <= 1000"
    )
    op.create_foreign_key("fk_jobs_approved_by", "jobs", "users", ["approved_by_user_id"], ["id"])
    op.create_table("job_requirements", sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("job_id", sa.Uuid(), nullable=False), sa.Column("requirement_type", sa.String(16), nullable=False), sa.Column("category", sa.String(32), nullable=False), sa.Column("content", sa.Text(), nullable=False), sa.Column("rank", sa.Integer(), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False), sa.CheckConstraint("requirement_type IN ('required', 'preferred')"), sa.CheckConstraint("category IN ('skill', 'experience', 'education', 'responsibility', 'certification', 'other')"), sa.CheckConstraint("char_length(content) BETWEEN 3 AND 500"), sa.CheckConstraint("rank > 0"), sa.ForeignKeyConstraint(["job_id"], ["jobs.id"]))
    op.create_index("ix_job_requirements_job_id", "job_requirements", ["job_id"])
    op.create_index("uq_job_requirements_rank", "job_requirements", ["job_id", "rank"], unique=True)


def downgrade() -> None:
    op.drop_table("job_requirements")
    op.drop_constraint("ck_jobs_review_note_length", "jobs", type_="check")
    op.drop_constraint("fk_jobs_approved_by", "jobs", type_="foreignkey")
    op.drop_column("jobs", "review_note")
    op.drop_column("jobs", "approved_by_user_id")
    op.drop_column("jobs", "approved_at")
    op.drop_column("jobs", "submitted_for_approval_at")
