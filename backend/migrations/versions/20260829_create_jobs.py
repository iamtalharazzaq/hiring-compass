"""create jobs

Revision ID: 20260829_jobs
Revises: 20260829_organizations
Create Date: 2026-08-29
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260829_jobs"
down_revision: str | Sequence[str] | None = "20260829_organizations"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "jobs",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("organization_id", sa.Uuid(), nullable=False),
        sa.Column("created_by_user_id", sa.Uuid(), nullable=False),
        sa.Column("title", sa.String(160), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("location", sa.String(160), nullable=True),
        sa.Column("employment_type", sa.String(32), nullable=True),
        sa.Column("workplace_type", sa.String(32), nullable=True),
        sa.Column("experience_min_years", sa.Integer(), nullable=True),
        sa.Column("experience_max_years", sa.Integer(), nullable=True),
        sa.Column("salary_min", sa.Numeric(14, 2), nullable=True),
        sa.Column("salary_max", sa.Numeric(14, 2), nullable=True),
        sa.Column("salary_currency", sa.String(3), nullable=True),
        sa.Column("status", sa.String(32), nullable=False, server_default="draft"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("closed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("archived_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("experience_min_years IS NULL OR experience_min_years >= 0"),
        sa.CheckConstraint("experience_max_years IS NULL OR experience_max_years >= 0"),
        sa.CheckConstraint(
            "experience_min_years IS NULL OR experience_max_years IS NULL "
            "OR experience_max_years >= experience_min_years"
        ),
        sa.CheckConstraint("salary_min IS NULL OR salary_max IS NULL OR salary_max >= salary_min"),
        sa.CheckConstraint(
            "(salary_min IS NULL AND salary_max IS NULL) OR salary_currency IS NOT NULL"
        ),
        sa.CheckConstraint("salary_currency IS NULL OR char_length(salary_currency) = 3"),
        sa.CheckConstraint(
            "employment_type IS NULL OR employment_type IN "
            "('full_time', 'part_time', 'contract', 'temporary', 'internship')"
        ),
        sa.CheckConstraint(
            "workplace_type IS NULL OR workplace_type IN ('remote', 'hybrid', 'onsite')"
        ),
        sa.CheckConstraint(
            "status IN ('draft', 'pending_approval', 'approved', 'closed', 'archived')"
        ),
        sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"]),
        sa.ForeignKeyConstraint(["created_by_user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_jobs_organization_id", "jobs", ["organization_id"])
    op.create_index("ix_jobs_organization_status", "jobs", ["organization_id", "status"])
    op.create_index("ix_jobs_organization_created_at", "jobs", ["organization_id", "created_at"])


def downgrade() -> None:
    op.drop_index("ix_jobs_organization_created_at", table_name="jobs")
    op.drop_index("ix_jobs_organization_status", table_name="jobs")
    op.drop_index("ix_jobs_organization_id", table_name="jobs")
    op.drop_table("jobs")
