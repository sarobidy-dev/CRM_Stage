from pydantic import BaseModel, Field
from typing import Optional

class ContactBase(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    entreprise: Optional[str] = None
    telephone: Optional[str] = None
    email: Optional[str] = None
    adresse: Optional[str] = None
    fonction: Optional[str] = None
    source: Optional[str] = None
    secteur: Optional[str] = None
    type: Optional[str] = None
    photo_de_profil: Optional[str] = None

class ContactCreate(ContactBase):
    nom: str
    prenom: str
    id_utilisateur: int

class ContactUpdate(ContactBase):
    pass

class ContactRead(ContactBase):
    id: int = Field(..., alias="id_contact")  # <-- alias ici
    id_utilisateur: int

    class Config:
        orm_mode = True
        allow_population_by_field_name = True  # permet d'utiliser aussi "id" comme champ lors de la création
