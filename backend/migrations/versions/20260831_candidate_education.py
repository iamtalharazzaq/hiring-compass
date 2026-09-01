"""add candidate education

Revision ID: 20260831_candidate_education
Revises: 20260831_phase3_parity
"""
from collections.abc import Sequence
import sqlalchemy as sa
from alembic import op

revision: str = "20260831_candidate_education"
down_revision: str | Sequence[str] | None = "20260831_phase3_parity"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column("candidates", sa.Column("education", sa.JSON(), nullable=False, server_default="[]"))
    op.alter_column("candidates", "education", server_default=None)

def downgrade() -> None:
    op.drop_column("candidates", "education")
