from enum import StrEnum


class ApplicationStatus(StrEnum):
    NEW = "new"
    SHORTLISTED = "shortlisted"
    INTERVIEWING = "interviewing"
    ON_HOLD = "on_hold"
    REJECTED = "rejected"
    DECISION_PENDING = "decision_pending"
    OFFER_APPROVED = "offer_approved"
