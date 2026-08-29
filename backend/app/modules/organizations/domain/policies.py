from .entities import OrganizationMember


def is_active_admin(member: OrganizationMember | None) -> bool:
    return bool(member and member.is_active and member.role == "admin")


def can_manage_organization(member: OrganizationMember | None) -> bool:
    return is_active_admin(member)
