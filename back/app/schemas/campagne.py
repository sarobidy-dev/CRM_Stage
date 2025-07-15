from pydantic import BaseModel
from typing import Optional


# 🔸 Schéma pour la création (POST)
class CampagneCreate(BaseModel):
    libelle: str
    description: Optional[str] = None
    projetProspection_id: int


# 🔸 Schéma pour la mise à jour (PATCH ou PUT)
class CampagneUpdate(BaseModel):
    libelle: Optional[str] = None
    description: Optional[str] = None
    projetProspection_id: Optional[int] = None


# 🔸 Schéma pour la lecture / retour
class CampagneRead(BaseModel):
    id: int
    libelle: str
    description: Optional[str] = None
    projetProspection_id: int

    class Config:
        orm_mode = True
