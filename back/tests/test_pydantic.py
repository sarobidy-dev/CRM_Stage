# test_pydantic.py

from pydantic import BaseModel, EmailStr
from typing import Optional

class FakeUtilisateur:
    def __init__(self):
        self.id = 1
        self.nom = "Espérant"
        self.email = "esperant@test.com"
        self.role = "admin"
        self.actif = True
        self.photo_profil = None

class UtilisateurRead(BaseModel):
    id: int
    nom: str
    email: EmailStr
    role: str
    actif: bool
    photo_profil: Optional[str] = None

    model_config = {
        "from_attributes": True
    }

u = FakeUtilisateur()
print(UtilisateurRead.model_validate(u).model_dump())
