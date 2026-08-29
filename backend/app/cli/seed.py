import argparse
import asyncio
import sys
from datetime import UTC, datetime

from sqlalchemy import func, select

from app.config import get_settings
from app.modules.auth.adapters.persistence.models import UserModel
from app.modules.auth.adapters.security.password_hasher import Argon2PasswordHasher
from app.modules.organizations.adapters.persistence.models import (
    OrganizationMemberModel,
    OrganizationModel,
)
from app.shared.database.engine import dispose_engine, session_factory

CONFIRM = "DELETE_SEED_DATA"


def validate_settings() -> None:
    settings = get_settings()
    if settings.app_env not in {"development", "local"}:
        raise RuntimeError("Seed commands run only in local or development environments.")
    password = settings.seed_admin_password
    if (
        password == "change_this_before_running_seed"
        or len(password) < 10
        or not any(c.isalpha() for c in password)
        or not any(c.isdigit() for c in password)
    ):
        raise RuntimeError(
            "SEED_ADMIN_PASSWORD must meet the signup password policy and not use the placeholder."
        )


async def up() -> None:
    validate_settings()
    s = get_settings()
    created_user = created_org = created_member = False
    async with session_factory() as db:
        async with db.begin():
            user = await db.scalar(
                select(UserModel).where(func.lower(UserModel.email) == s.seed_admin_email.lower())
            )
            if not user:
                now = datetime.now(UTC)
                user = UserModel(
                    email=s.seed_admin_email.lower(),
                    display_name=s.seed_admin_name,
                    password_hash=Argon2PasswordHasher().hash(s.seed_admin_password),
                    is_active=True,
                    created_at=now,
                    updated_at=now,
                )
                db.add(user)
                await db.flush()
                created_user = True
            org = await db.scalar(
                select(OrganizationModel).where(OrganizationModel.slug == s.seed_organization_slug)
            )
            if not org:
                now = datetime.now(UTC)
                org = OrganizationModel(
                    name=s.seed_organization_name,
                    slug=s.seed_organization_slug,
                    created_by_user_id=user.id,
                    created_at=now,
                    updated_at=now,
                )
                db.add(org)
                await db.flush()
                created_org = True
            member = await db.scalar(
                select(OrganizationMemberModel).where(
                    OrganizationMemberModel.organization_id == org.id,
                    OrganizationMemberModel.user_id == user.id,
                )
            )
            if not member:
                now = datetime.now(UTC)
                db.add(
                    OrganizationMemberModel(
                        organization_id=org.id,
                        user_id=user.id,
                        role="admin",
                        is_active=True,
                        joined_at=now,
                        updated_at=now,
                    )
                )
                created_member = True
            elif not member.is_active or member.role != "admin":
                raise RuntimeError(
                    "Existing seed membership is not an active admin; refusing to change it."
                )
    print(
        f"Seed completed.\n\nOrganization: {s.seed_organization_name} "
        f"({'created' if created_org else 'reused'})\nAdmin user: {s.seed_admin_email} "
        f"({'created' if created_user else 'reused'})\nAdmin membership: "
        f"{'created' if created_member else 'reused'}"
    )


async def down(confirm: str) -> None:
    validate_settings()
    if confirm != CONFIRM:
        raise RuntimeError("Confirmation token is required.")
    s = get_settings()
    async with session_factory() as db:
        async with db.begin():
            user = await db.scalar(
                select(UserModel).where(func.lower(UserModel.email) == s.seed_admin_email.lower())
            )
            org = await db.scalar(
                select(OrganizationModel).where(OrganizationModel.slug == s.seed_organization_slug)
            )
            if not user or not org:
                print("No matching seed data found. Nothing was removed.")
                return
            member = await db.scalar(
                select(OrganizationMemberModel).where(
                    OrganizationMemberModel.organization_id == org.id,
                    OrganizationMemberModel.user_id == user.id,
                )
            )
            if not member:
                print("No matching seed data found. Nothing was removed.")
                return
            org_count = int(
                await db.scalar(
                    select(func.count())
                    .select_from(OrganizationMemberModel)
                    .where(OrganizationMemberModel.organization_id == org.id)
                )
                or 0
            )
            user_count = int(
                await db.scalar(
                    select(func.count())
                    .select_from(OrganizationMemberModel)
                    .where(OrganizationMemberModel.user_id == user.id)
                )
                or 0
            )
            if org_count != 1:
                raise RuntimeError("Seed organization has other memberships; nothing was removed.")
            if user_count != 1:
                raise RuntimeError(
                    "Seed user belongs to another organization; nothing was removed."
                )
            await db.delete(member)
            await db.delete(org)
            await db.delete(user)
    print("Seed data removed.\n\nMembership: removed\nOrganization: removed\nAdmin user: removed")


def main() -> None:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("up")
    down_parser = sub.add_parser("down")
    down_parser.add_argument("--confirm", default="")
    args = parser.parse_args()
    try:
        asyncio.run(up() if args.command == "up" else down(args.confirm))
    except RuntimeError as e:
        print(f"Seed failed: {e}", file=sys.stderr)
        raise SystemExit(1) from None
    finally:
        asyncio.run(dispose_engine())


if __name__ == "__main__":
    main()
