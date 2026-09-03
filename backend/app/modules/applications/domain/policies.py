# ruff: noqa: E501
from .enums import ApplicationStatus

TRANSITIONS = {
    ApplicationStatus.NEW: {
        ApplicationStatus.SHORTLISTED,
        ApplicationStatus.ON_HOLD,
        ApplicationStatus.REJECTED,
    },
    ApplicationStatus.SHORTLISTED: {ApplicationStatus.ON_HOLD, ApplicationStatus.REJECTED},
    ApplicationStatus.INTERVIEWING: {ApplicationStatus.DECISION_PENDING, ApplicationStatus.SHORTLISTED, ApplicationStatus.ON_HOLD, ApplicationStatus.REJECTED},
    ApplicationStatus.DECISION_PENDING: {ApplicationStatus.HIRED, ApplicationStatus.REJECTED, ApplicationStatus.ON_HOLD},
    ApplicationStatus.ON_HOLD: {
        ApplicationStatus.NEW,
        ApplicationStatus.SHORTLISTED,
        ApplicationStatus.REJECTED,
    },
    ApplicationStatus.REJECTED: set(),
    ApplicationStatus.HIRED: set(),
    ApplicationStatus.ONBOARDING: set(),
    ApplicationStatus.ONBOARDED: set(),
}


def can_transition(current: ApplicationStatus, target: ApplicationStatus) -> bool:
    return target in TRANSITIONS[current]
