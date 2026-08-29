from dataclasses import dataclass

from app.modules.auth.application.dto import AuthenticatedUser
from app.modules.organizations.domain.entities import Organization, OrganizationMember


@dataclass(frozen=True)
class MemberDetails:
    member: OrganizationMember
    user: AuthenticatedUser


@dataclass(frozen=True)
class OrganizationDetails:
    organization: Organization
    membership: OrganizationMember
