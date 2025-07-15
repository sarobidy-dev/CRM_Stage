from pydantic import BaseModel, EmailStr
from typing import Optional

class UtilisateurBase(BaseModel):
    
    nom: str
    email: EmailStr
    mot2pass: str
    role: str
    actif : bool
    photo_profil: Optional[str] = None  # Nouveau champ

class UtilisateurCreate(UtilisateurBase):
    nom: str
    email: EmailStr
    mot2pass: str
    role: str
    actif : bool
    photo_profil: Optional[str] = None

class UtilisateurRead(UtilisateurBase):
    nom: str
    email: EmailStr
    mot2pass: str
    role: str
    actif: Optional[bool] = None    
    photo_profil: Optional[str] = None

class UtilisateurDelete(BaseModel):
    confirmation: bool

class UtilisateurUpdate(BaseModel):
    nom: Optional[str] = None
    mot2pass: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    photo_profil: Optional[str] = None  

    class Config:
        orm_mode = True
