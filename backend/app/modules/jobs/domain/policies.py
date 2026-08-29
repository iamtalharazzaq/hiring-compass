from .enums import JobStatus


def can_edit(status: JobStatus) -> bool:
    return status is JobStatus.DRAFT


def can_close(status: JobStatus) -> bool:
    return status in {JobStatus.DRAFT, JobStatus.PENDING_APPROVAL, JobStatus.APPROVED}


def can_archive(status: JobStatus) -> bool:
    return status is JobStatus.CLOSED
