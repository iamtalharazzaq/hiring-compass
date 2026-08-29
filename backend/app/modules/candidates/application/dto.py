from dataclasses import dataclass


@dataclass(frozen=True)
class CandidateInput:
    full_name: str | None = None
    email: str | None = None
    phone: str | None = None
    location: str | None = None
    current_title: str | None = None
    years_of_experience: int | None = None
    summary: str | None = None
    fields: frozenset[str] = frozenset()
