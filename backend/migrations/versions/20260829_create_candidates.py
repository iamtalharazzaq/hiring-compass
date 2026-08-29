"""create candidates

Revision ID: 20260829_candidates
Revises: 20260829_jobs
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260829_candidates"
down_revision: str | Sequence[str] | None = "20260829_job_requirements"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "candidates",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("organization_id", sa.Uuid(), nullable=False),
        sa.Column("created_by_user_id", sa.Uuid(), nullable=False),
        sa.Column("full_name", sa.String(160), nullable=False),
        sa.Column("email", sa.String(255)),
        sa.Column("phone", sa.String(30)),
        sa.Column("location", sa.String(160)),
        sa.Column("current_title", sa.String(160)),
        sa.Column("years_of_experience", sa.Integer()),
        sa.Column("summary", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("char_length(full_name) BETWEEN 2 AND 160"),
        sa.CheckConstraint("years_of_experience IS NULL OR years_of_experience BETWEEN 0 AND 60"),
        sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"]),
        sa.ForeignKeyConstraint(["created_by_user_id"], ["users.id"]),
    )
    op.create_index("ix_candidates_organization_id", "candidates", ["organization_id"])
    op.create_index(
        "ix_candidates_organization_created_at", "candidates", ["organization_id", "created_at"]
    )
    op.execute(
        "CREATE UNIQUE INDEX ix_candidates_org_email_lower ON candidates "
        "(organization_id, lower(email)) WHERE email IS NOT NULL"
    )


def downgrade() -> None:
    op.drop_table("candidates")
