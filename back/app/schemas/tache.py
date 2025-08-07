from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TacheBase(BaseModel):
    titre: str = Field(..., example="Appeler le client X")
    description: Optional[str] = Field(None, example="Discuter du nouveau contrat")
    date_echeance: Optional[datetime] = Field(None, example="2025-08-15T10:00:00")
    statut: str = Field("en attente", example="en attente")
    contact_id: int = Field(..., example=1)

class TacheCreate(TacheBase):
    pass

class TacheUpdate(BaseModel):
    # Tous les champs sont explicitement optionnels avec une valeur par défaut de None
    titre: Optional[str] = None
    description: Optional[str] = None
    date_echeance: Optional[datetime] = None
    statut: Optional[str] = None
    contact_id: Optional[int] = None # Ajouté pour permettre la mise à jour du contact_id

class TacheOut(TacheBase):
    id: int
    date_creation: datetime

    class Config:
        orm_mode = True # Permet la compatibilité avec SQLAlchemy ORM
