"""complete interview status and structured offer fields
Revision ID: 20260831_phase3_parity
Revises: 20260831_communications, 20260831_email_deliveries
"""
import sqlalchemy as sa
from alembic import op

revision = "20260831_phase3_parity"
down_revision = ("20260831_communications", "20260831_email_deliveries")
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.drop_constraint("interviews_status_check", "interviews", type_="check")
    op.create_check_constraint("interviews_status_check", "interviews", "status IN ('scheduled','completed','cancelled')")
    op.add_column("candidate_communications", sa.Column("salary_amount", sa.Numeric(14, 2)))
    op.add_column("candidate_communications", sa.Column("salary_currency", sa.String(3)))
    op.add_column("candidate_communications", sa.Column("start_date", sa.Date()))
    op.add_column("candidate_communications", sa.Column("employment_details", sa.Text()))
    op.add_column("candidate_communications", sa.Column("expires_at", sa.Date()))

def downgrade() -> None:
    for column in ("expires_at", "employment_details", "start_date", "salary_currency", "salary_amount"):
        op.drop_column("candidate_communications", column)
    op.drop_constraint("interviews_status_check", "interviews", type_="check")
    op.create_check_constraint("interviews_status_check", "interviews", "status IN ('scheduled','cancelled')")
