from pydantic import BaseModel
from typing import Optional
from datetime import date


# 🔸 Création
class HistoriqueActionCreate(BaseModel):
    date: date
    commentaire: Optional[str] = None
    action: str
    pourcentageVente: Optional[float] = None
    entreprise_id: int
    campagne_id: int
    utilisateur_id: int


# 🔸 Mise à jour
class HistoriqueActionUpdate(BaseModel):
    date: Optional[date] = None
    commentaire: Optional[str] = None
    action: Optional[str] = None
    pourcentageVente: Optional[float] = None
    entreprise_id: Optional[int] = None
    campagne_id: Optional[int] = None
    utilisateur_id: Optional[int] = None


# 🔸 Lecture
class HistoriqueActionRead(BaseModel):
    id: int
    date: date
    commentaire: Optional[str]
    action: str
    pourcentageVente: Optional[float]
    entreprise_id: int
    campagne_id: int
    utilisateur_id: int

    model_config = {
        "from_attributes": True  # ✅ Nécessaire pour .from_orm() en Pydantic v2
    }