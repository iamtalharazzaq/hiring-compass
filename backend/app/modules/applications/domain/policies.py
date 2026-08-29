from .enums import ApplicationStatus

TRANSITIONS = {
    ApplicationStatus.NEW: {
        ApplicationStatus.SHORTLISTED,
        ApplicationStatus.ON_HOLD,
        ApplicationStatus.REJECTED,
    },
    ApplicationStatus.SHORTLISTED: {ApplicationStatus.ON_HOLD, ApplicationStatus.REJECTED},
    ApplicationStatus.ON_HOLD: {
        ApplicationStatus.NEW,
        ApplicationStatus.SHORTLISTED,
        ApplicationStatus.REJECTED,
    },
    ApplicationStatus.REJECTED: set(),
}


def can_transition(current: ApplicationStatus, target: ApplicationStatus) -> bool:
    return target in TRANSITIONS[current]
