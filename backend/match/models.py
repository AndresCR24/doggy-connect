from enum import Enum
from pydantic import BaseModel, Field, model_validator
from typing import Optional
from datetime import datetime


class SwipeAction(str, Enum):
    like = "like"
    dislike = "dislike"


class SwipeCreate(BaseModel):
    from_pet_id: str
    to_pet_id: str
    action: SwipeAction

    @model_validator(mode="after")
    def validate_not_same_pet(self):
        if self.from_pet_id == self.to_pet_id:
            raise ValueError("A pet cannot swipe itself")
        return self


class SwipeResponse(SwipeCreate):
    id: str
    created_at: datetime


class MatchStatus(str, Enum):
    active = "active"
    blocked = "blocked"
    unmatched = "unmatched"


class MatchCreate(BaseModel):
    pet_a_id: str
    pet_b_id: str


class MatchResponse(MatchCreate):
    id: str
    status: MatchStatus = MatchStatus.active
    created_at: datetime


class Gender(str, Enum):
    male = "male"
    female = "female"


class MatchPreferences(BaseModel):
    pet_id: str
    preferred_gender: Optional[Gender] = None
    preferred_breed: Optional[str] = None
    max_distance_km: Optional[int] = Field(default=5, gt=0)