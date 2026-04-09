from pydantic import BaseModel, EmailStr
from typing import Optional

# Modelo para cuando el cliente envía datos (POST/PUT)
class UserCreate(BaseModel):
    nombre: str
    email: EmailStr
    nombre_mascota: str
    raza_mascota: Optional[str] = "No especificada"

# Modelo para cuando la API devuelve datos (incluye el ID generado)
class UserResponse(UserCreate):
    id: str