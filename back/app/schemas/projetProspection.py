from pydantic import BaseModel
from typing import Optional


class ProjetProspectionCreate(BaseModel):
    projet: str
    description: Optional[str] = None


class ProjetProspectionUpdate(BaseModel):
    projet: Optional[str] = None
    description: Optional[str] = None


class ProjetProspectionRead(BaseModel):
    id: int
    projet: str
    description: Optional[str]

<<<<<<< HEAD
    model_config = {
        "from_attributes": True  # ✅ Nécessaire pour .from_orm() en Pydantic v2
    }
=======
    class Config:
        orm_mode = True
>>>>>>> c30d4e42dc3b458af4b31e95d80d16f7cd91d065
