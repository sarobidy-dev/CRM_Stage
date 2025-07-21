from pydantic import BaseModel
from typing import Optional


class ProjetUtilisateurCreate(BaseModel):
    pourcentageVente: float
    projetProspection_id: int
    utilisateur_id: int


class ProjetUtilisateurUpdate(BaseModel):
    pourcentageVente: Optional[float] = None
    projetProspection_id: Optional[int] = None
    utilisateur_id: Optional[int] = None


class ProjetUtilisateurRead(BaseModel):
    id: int
    pourcentageVente: float
    projetProspection_id: int
    utilisateur_id: int

    class Config:
        orm_mode = True
