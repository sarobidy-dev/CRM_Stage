from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class TacheBase(BaseModel):
    titre: str
    description: Optional[str] = None
    date_echeance: Optional[date] = None
    est_recurrente: Optional[bool] = False
    rappel: Optional[datetime] = None
    statut: Optional[str] = None
    id_opportunite: int

class TacheCreate(TacheBase):
    pass

class TacheUpdate(BaseModel):
    titre: Optional[str] = None
    description: Optional[str] = None
    date_echeance: Optional[date] = None
    est_recurrente: Optional[bool] = None
    rappel: Optional[datetime] = None
    statut: Optional[str] = None
    id_opportunite: Optional[int] = None

class TacheInDBBase(TacheBase):
    id_tache: int

    class Config:
        orm_mode = True

class Tache(TacheInDBBase):
    pass
