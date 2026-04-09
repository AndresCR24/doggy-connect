from enum import Enum
from pydantic import BaseModel, EmailStr
from typing import Optional


class UserRole(str, Enum):
    owner = "owner"
    walker = "walker"
    admin = "admin"


class UserCreate(BaseModel):
    nombre: str
    email: EmailStr
    role: UserRole = UserRole.owner
    telefono: Optional[str] = None
    ciudad: Optional[str] = None


class UserResponse(UserCreate):
    id: str