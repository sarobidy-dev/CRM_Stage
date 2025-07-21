<<<<<<< HEAD
from pydantic import BaseModel, EmailStr, ConfigDict
=======
from pydantic import BaseModel, EmailStr
>>>>>>> c30d4e42dc3b458af4b31e95d80d16f7cd91d065
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
<<<<<<< HEAD
    email: Optional[str]          # ↔ tu peux garder EmailStr ici aussi si tu veux
    adresse: Optional[str]
    fonction: Optional[str]
    entreprise_id: Optional[int] 
    # ✅ Configuration unique pour Pydantic v2
    model_config = ConfigDict(from_attributes=True)
=======
    email: Optional[str]
    adresse: Optional[str]
    fonction: Optional[str]
    entreprise_id: int

    class Config:
        orm_mode = True
>>>>>>> c30d4e42dc3b458af4b31e95d80d16f7cd91d065
