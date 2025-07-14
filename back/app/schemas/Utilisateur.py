from pydantic import BaseModel, EmailStr
from typing import Optional

class UtilisateurBase(BaseModel):
    nom: str
    prenom: str
    email: EmailStr
    role: str
    numero_tel: str
    photo_profil: Optional[str] = None  # Nouveau champ

class UtilisateurCreate(UtilisateurBase):
    mot_de_passe: str

class UtilisateurRead(UtilisateurBase):
    id_utilisateur: int

class UtilisateurDelete(BaseModel):
    confirmation: bool

class UtilisateurUpdate(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    email: Optional[EmailStr] = None
    mot_de_passe: Optional[str] = None
    photo_profil: Optional[str] = None  

    class Config:
        orm_mode = True
