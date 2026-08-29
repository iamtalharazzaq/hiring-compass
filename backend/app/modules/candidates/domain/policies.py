from app.modules.organizations.domain.entities import OrganizationMember


def can_manage_candidates(member: OrganizationMember) -> bool:
    return member.role in {"admin", "recruiter"}


def can_view_candidates(member: OrganizationMember) -> bool:
    return member.role in {"admin", "recruiter", "hiring_manager"}
