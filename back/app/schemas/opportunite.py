from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional

class OpportuniteBase(BaseModel):
    titre: str
    description: Optional[str]
    date_interaction: datetime
    contenu: Optional[str]
    date_creation: date
    prob_abill_suc: int
    statut: str
    etape_pipeline: str
    id_utilisateur: int
    id_entreprise: int

class OpportuniteCreate(OpportuniteBase):
    pass

class OpportuniteRead(OpportuniteBase):
    id_opportunite: int

    class Config:
        orm_mode = True
