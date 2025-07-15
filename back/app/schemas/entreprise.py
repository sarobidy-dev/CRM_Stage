from pydantic import BaseModel, EmailStr
from typing import Optional


class EntrepriseCreate(BaseModel):
    raisonSocial: str
    telephoneStandard: str
    emailStandart: EmailStr
    adresse_id: int
    utilisateur_id: int


class EntrepriseUpdate(BaseModel):
    raisonSocial: Optional[str] = None
    telephoneStandard: Optional[str] = None
    emailStandart: Optional[EmailStr] = None
    adresse_id: Optional[int] = None
    utilisateur_id: Optional[int] = None


class EntrepriseRead(BaseModel):
    id: int
    raisonSocial: str
    telephoneStandard: str
    emailStandart: str
    adresse_id: int
    utilisateur_id: int

    class Config:
        orm_mode = True
