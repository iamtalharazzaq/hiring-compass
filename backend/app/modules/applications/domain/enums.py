from enum import StrEnum


class ApplicationStatus(StrEnum):
    NEW = "new"
    SHORTLISTED = "shortlisted"
    ON_HOLD = "on_hold"
    REJECTED = "rejected"
