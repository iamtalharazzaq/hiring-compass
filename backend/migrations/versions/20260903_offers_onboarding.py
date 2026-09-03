"""add manual offers and onboarding

Revision ID: 20260903_offers
Revises: 20260831_candidate_education
"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260903_offers"
down_revision: str | Sequence[str] | None = "20260831_candidate_education"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_constraint("applications_status_check", "applications", type_="check")
    op.create_check_constraint("applications_status_check", "applications", "status IN ('new','shortlisted','interviewing','decision_pending','hired','onboarding','onboarded','on_hold','rejected')")
    op.create_table("offers", sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("organization_id", sa.Uuid(), nullable=False), sa.Column("application_id", sa.Uuid(), nullable=False, unique=True), sa.Column("candidate_token", sa.Uuid(), nullable=False, unique=True), sa.Column("job_title", sa.String(200), nullable=False), sa.Column("salary", sa.String(80), nullable=False), sa.Column("currency", sa.String(8), nullable=False), sa.Column("start_date", sa.Date(), nullable=False), sa.Column("employment_type", sa.String(80), nullable=False), sa.Column("work_location", sa.String(200), nullable=False), sa.Column("expiry_date", sa.Date(), nullable=False), sa.Column("additional_terms", sa.Text()), sa.Column("status", sa.String(20), nullable=False), sa.Column("created_by", sa.Uuid(), nullable=False), sa.Column("approved_by", sa.Uuid()), sa.Column("sent_at", sa.DateTime(timezone=True)), sa.Column("responded_at", sa.DateTime(timezone=True)), sa.Column("created_at", sa.DateTime(timezone=True), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False), sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"]), sa.ForeignKeyConstraint(["application_id"], ["applications.id"]), sa.ForeignKeyConstraint(["created_by"], ["users.id"]), sa.ForeignKeyConstraint(["approved_by"], ["users.id"]), sa.CheckConstraint("status IN ('draft','pending_approval','approved','sent','accepted','declined','expired')"))
    op.create_index("ix_offers_organization_id", "offers", ["organization_id"])
    op.create_table("onboardings", sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("organization_id", sa.Uuid(), nullable=False), sa.Column("application_id", sa.Uuid(), nullable=False, unique=True), sa.Column("status", sa.String(20), nullable=False), sa.Column("started_at", sa.DateTime(timezone=True)), sa.Column("completed_at", sa.DateTime(timezone=True)), sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"]), sa.ForeignKeyConstraint(["application_id"], ["applications.id"]), sa.CheckConstraint("status IN ('not_started','in_progress','completed')"))
    op.create_index("ix_onboardings_organization_id", "onboardings", ["organization_id"])
    op.create_table("onboarding_tasks", sa.Column("id", sa.Uuid(), primary_key=True), sa.Column("onboarding_id", sa.Uuid(), nullable=False), sa.Column("title", sa.String(200), nullable=False), sa.Column("owner", sa.String(200)), sa.Column("due_date", sa.Date()), sa.Column("is_required", sa.Boolean(), nullable=False), sa.Column("completed_at", sa.DateTime(timezone=True)), sa.Column("position", sa.Integer(), nullable=False), sa.ForeignKeyConstraint(["onboarding_id"], ["onboardings.id"]))
    op.create_index("ix_onboarding_tasks_onboarding_id", "onboarding_tasks", ["onboarding_id"])


def downgrade() -> None:
    op.drop_table("onboarding_tasks")
    op.drop_table("onboardings")
    op.drop_table("offers")
    op.drop_constraint("applications_status_check", "applications", type_="check")
    op.create_check_constraint("applications_status_check", "applications", "status IN ('new','shortlisted','interviewing','decision_pending','offer_approved','on_hold','rejected')")
