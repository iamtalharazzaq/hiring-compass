from datetime import date
from decimal import Decimal
from typing import Literal
from pydantic import BaseModel, Field, model_validator
CommunicationType = Literal["interview_follow_up", "next_steps", "offer", "rejection", "hold"]
class CommunicationRequest(BaseModel):
    communication_type: CommunicationType
    subject: str = Field(min_length=1, max_length=255)
    body: str = Field(min_length=1, max_length=20000)
    salary_amount: Decimal | None = Field(default=None, ge=0, max_digits=14, decimal_places=2)
    salary_currency: str | None = Field(default=None, min_length=3, max_length=3)
    start_date: date | None = None
    employment_details: str | None = None
    expires_at: date | None = None

    @model_validator(mode="after")
    def valid_offer_dates(self) -> "CommunicationRequest":
        if self.communication_type == "offer" and self.expires_at and self.start_date and self.expires_at < self.start_date:
            raise ValueError("Offer expiry must be on or after the start date.")
        if self.salary_amount is not None and not self.salary_currency:
            raise ValueError("Currency is required when salary is provided.")
        return self
class ReviewRequest(BaseModel):
    review_notes: str | None = Field(default=None, max_length=4000)
