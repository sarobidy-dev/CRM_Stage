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

    model_config = {
        "from_attributes": True  # ✅ Nécessaire pour .from_orm() en Pydantic v2
    }
