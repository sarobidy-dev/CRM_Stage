<<<<<<< HEAD
from pydantic import BaseModel, EmailStr,ConfigDict
=======
from pydantic import BaseModel, EmailStr
>>>>>>> c30d4e42dc3b458af4b31e95d80d16f7cd91d065
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
<<<<<<< HEAD
    utilisateur_id: Optional[int]
    
    model_config = ConfigDict(from_attributes=True) 
=======
    utilisateur_id: int

    class Config:
        orm_mode = True
>>>>>>> c30d4e42dc3b458af4b31e95d80d16f7cd91d065
