# ruff: noqa: E501, E701, E702, I001
from pydantic import BaseModel, Field
from typing import Literal
class DecisionRequest(BaseModel):
    proposed_outcome: Literal["proceed_to_offer", "reject", "hold"]
    rationale: str = Field(min_length=1)
class ReviewRequest(BaseModel):
    review_notes: str | None = None
