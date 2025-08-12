from pydantic import BaseModel, EmailStr
from typing import Optional

class UtilisateurUpdateRequest(BaseModel):
    email: Optional[EmailStr] = None
    nom: Optional[str] = None
    actif: Optional[bool] = None

class EmailRequest(BaseModel):
    destinator: EmailStr
    subject: str
    body: str
