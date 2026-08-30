# ruff: noqa: E501
from .enums import ApplicationStatus

TRANSITIONS = {
    ApplicationStatus.NEW: {
        ApplicationStatus.SHORTLISTED,
        ApplicationStatus.ON_HOLD,
        ApplicationStatus.REJECTED,
    },
    ApplicationStatus.SHORTLISTED: {ApplicationStatus.INTERVIEWING, ApplicationStatus.ON_HOLD, ApplicationStatus.REJECTED},
    ApplicationStatus.INTERVIEWING: {ApplicationStatus.DECISION_PENDING, ApplicationStatus.ON_HOLD, ApplicationStatus.REJECTED},
    ApplicationStatus.DECISION_PENDING: {ApplicationStatus.OFFER_APPROVED, ApplicationStatus.REJECTED, ApplicationStatus.ON_HOLD},
    ApplicationStatus.ON_HOLD: {
        ApplicationStatus.NEW,
        ApplicationStatus.SHORTLISTED,
        ApplicationStatus.REJECTED,
    },
    ApplicationStatus.REJECTED: set(),
    ApplicationStatus.OFFER_APPROVED: set(),
}


def can_transition(current: ApplicationStatus, target: ApplicationStatus) -> bool:
    return target in TRANSITIONS[current]
