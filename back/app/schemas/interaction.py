from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class InteractionBase(BaseModel):
    type: str
    date_interaction: datetime
    contenu: Optional[str] = None
    fichier_joint: Optional[str] = None
    id_contact: int

class InteractionCreate(InteractionBase):
    pass

class InteractionRead(InteractionBase):
    id_interaction: int

    class Config:
        orm_mode = True
