from datetime import datetime
from typing import Optional
from schemas.Utilisateur import UtilisateurRead
from schemas.campagne import CampagneRead
from schemas.entreprise import EntrepriseRead

from pydantic import BaseModel


class HAContactCreate(BaseModel):
    ha_id: int
    contact_id: int


class HAContactRead(BaseModel):
    id: int
    ha_id: int
    contact_id: int

    class Config:
        from_attributes = True
class HistoriqueActionRead(BaseModel):
    id: int
    action: str
    date: datetime
    commentaire: Optional[str]
    pourcentageVente: Optional[int]
    utilisateur: Optional[UtilisateurRead]
    entreprise: Optional[EntrepriseRead]
    campagne: Optional[CampagneRead]

    class Config:
        from_attributes = True 