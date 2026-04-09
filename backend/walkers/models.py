from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional


class VerificationStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class WalkerCreate(BaseModel):
    user_id: str
    experiencia_anios: Optional[int] = Field(default=0, ge=0)
    precio_por_hora: float = Field(..., gt=0)
    radio_servicio_km: int = Field(default=5, gt=0)
    verificado: bool = False
    estado_verificacion: VerificationStatus = VerificationStatus.pending


class WalkerResponse(WalkerCreate):
    id: str
    rating: float = 0.0
    completed_walks: int = 0