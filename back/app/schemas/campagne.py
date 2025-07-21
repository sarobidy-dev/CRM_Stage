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

<<<<<<< HEAD
    model_config = {
        "from_attributes": True  # ✅ Nécessaire pour .from_orm() en Pydantic v2
    }
=======
    class Config:
        orm_mode = True
>>>>>>> c30d4e42dc3b458af4b31e95d80d16f7cd91d065
