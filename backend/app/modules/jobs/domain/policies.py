from .enums import JobStatus


def can_edit(status: JobStatus) -> bool:
    return status is JobStatus.DRAFT


def can_close(status: JobStatus) -> bool:
    return status is JobStatus.APPROVED


def can_archive(status: JobStatus) -> bool:
    return status is JobStatus.CLOSED
