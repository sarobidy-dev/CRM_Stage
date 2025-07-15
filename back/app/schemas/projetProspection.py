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

    class Config:
        orm_mode = True
