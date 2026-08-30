from typing import Literal
from pydantic import BaseModel, Field
CommunicationType = Literal["interview_follow_up", "next_steps", "offer", "rejection", "hold"]
class CommunicationRequest(BaseModel):
    communication_type: CommunicationType
    subject: str = Field(min_length=1, max_length=255)
    body: str = Field(min_length=1, max_length=20000)
class ReviewRequest(BaseModel):
    review_notes: str | None = Field(default=None, max_length=4000)
