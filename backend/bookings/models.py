from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class BookingStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


class PaymentStatus(str, Enum):
    pending = "pending"
    paid = "paid"
    refunded = "refunded"


class BookingCreate(BaseModel):
    pet_id: str
    owner_user_id: str
    walker_user_id: str
    start_time: datetime
    duration_minutes: int = Field(..., gt=0)
    price: float = Field(..., gt=0)
    notes: Optional[str] = None


class BookingResponse(BookingCreate):
    id: str
    status: BookingStatus = BookingStatus.pending
    payment_status: PaymentStatus = PaymentStatus.pending
    created_at: datetime
    updated_at: Optional[datetime] = None