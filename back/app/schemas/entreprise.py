from pydantic import BaseModel, EmailStr
from typing import Optional

class EntrepriseBase(BaseModel):
    nom: str
    adresse: Optional[str] = None
    secteur: Optional[str] = None
    telephone: Optional[str] = None
    email: Optional[EmailStr] = None

class EntrepriseCreate(EntrepriseBase):
    pass

class EntrepriseRead(EntrepriseBase):
    id_entreprise: int

    class Config:
        orm_mode = True

class EntrepriseUpdate(EntrepriseBase):
    pass
