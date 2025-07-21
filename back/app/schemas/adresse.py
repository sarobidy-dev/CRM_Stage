from pydantic import BaseModel
from typing import Optional


class AdresseCreate(BaseModel):
    ligneAdresse1: str
    ligneAdresse2: Optional[str] = None
    ville: str
    cp: str
    pays: str


class AdresseUpdate(BaseModel):
    ligneAdresse1: Optional[str] = None
    ligneAdresse2: Optional[str] = None
    ville: Optional[str] = None
    cp: Optional[str] = None
    pays: Optional[str] = None


class AdresseRead(BaseModel):
    id: int
    ligneAdresse1: str
    ligneAdresse2: Optional[str]
    ville: str
    cp: str
    pays: str

    class Config:
        from_attributes = True
