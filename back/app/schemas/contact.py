from pydantic import BaseModel, EmailStr
from typing import Optional


class ContactCreate(BaseModel):
    nom: str
    prenom: Optional[str] = None
    telephone: Optional[str] = None
    email: Optional[EmailStr] = None
    adresse: Optional[str] = None
    fonction: Optional[str] = None
    entreprise_id: int


class ContactUpdate(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    telephone: Optional[str] = None
    email: Optional[EmailStr] = None
    adresse: Optional[str] = None
    fonction: Optional[str] = None
    entreprise_id: Optional[int] = None


class ContactRead(BaseModel):
    id: int
    nom: str
    prenom: Optional[str]
    telephone: Optional[str]
    email: Optional[str]
    adresse: Optional[str]
    fonction: Optional[str]
    entreprise_id: int

    class Config:
        orm_mode = True
