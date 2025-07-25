from pydantic import BaseModel, EmailStr,ConfigDict,validator
from typing import Optional


class EntrepriseCreate(BaseModel):
    raisonSocial: str
    telephoneStandard: str
    emailStandart: EmailStr
    adresse_id: int
    utilisateur_id: int
    @validator("telephoneStandard")
    def validate_telephone(cls, v):
        if not v.isdigit():
            raise ValueError("Le téléphone doit contenir uniquement des chiffres")
        return v

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
    utilisateur_id: Optional[int]
    
    model_config = ConfigDict(from_attributes=True) 
