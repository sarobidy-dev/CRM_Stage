from pydantic import BaseModel, validator
from datetime import datetime
from typing import Optional
import re

class SMSBase(BaseModel):
    id_contact: int
    message: str
    telephone: str
    expediteur: Optional[str] = "0385805381"

class SMSCreate(SMSBase):
    @validator('message')
    def validate_message(cls, v):
        if not v or not v.strip():
            raise ValueError('Le message ne peut pas être vide')
        if len(v) > 160:
            raise ValueError('Le message ne peut pas dépasser 160 caractères')
        return v.strip()
    
    @validator('telephone')
    def validate_telephone(cls, v):
        # Validation pour numéros malgaches
        phone_pattern = r'^(\+261|0)[0-9]{9}$'
        if not re.match(phone_pattern, v):
            raise ValueError('Numéro de téléphone invalide. Format attendu: +261XXXXXXXXX ou 0XXXXXXXXX')
        return v

class SMSBulkCreate(BaseModel):
    contacts: list[dict]  # Liste des contacts avec id, nom, prenom, telephone
    message: str
    
    @validator('message')
    def validate_message(cls, v):
        if not v or not v.strip():
            raise ValueError('Le message ne peut pas être vide')
        if len(v) > 160:
            raise ValueError('Le message ne peut pas dépasser 160 caractères')
        return v.strip()
    
    @validator('contacts')
    def validate_contacts(cls, v):
        if not v or len(v) == 0:
            raise ValueError('Au moins un contact doit être fourni')
        return v

class SMSResponse(SMSBase):
    id: int
    date_envoyee: datetime
    statut: str
    type: str
    
    class Config:
        from_attributes = True

class SMSBulkResponse(BaseModel):
    success: bool
    message: str
    total_sent: int
    total_failed: int
    results: list[dict]

class SMSHistoryResponse(BaseModel):
    id: int
    id_contact: int
    message: str
    telephone: str
    date_envoyee: datetime
    statut: str
    expediteur: str
    contact_name: Optional[str] = None
    
    class Config:
        from_attributes = True
