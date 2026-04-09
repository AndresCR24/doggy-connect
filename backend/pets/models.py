from enum import Enum
from pydantic import BaseModel
from typing import Optional


class Species(str, Enum):
    dog = "dog"
    cat = "cat"


class PetCreate(BaseModel):
    owner_id: str
    nombre: str
    especie: Species
    raza: Optional[str] = "No especificada"
    edad: Optional[int] = None
    genero: Optional[str] = None


class PetResponse(PetCreate):
    id: str