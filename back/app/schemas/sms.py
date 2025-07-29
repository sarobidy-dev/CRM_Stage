from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from pydantic_settings import BaseSettings, SettingsConfigDict

class SendSMSRequest(BaseModel):
    id_contact: Optional[int] = None
    message: str
    expediteur: str
    type: Optional[str] = "envoyé"

class SMSOut(BaseModel):
    id: int
    id_contact: Optional[int]
    message: str
    date_envoyee: datetime
    statut: str  # corrigé pour matcher le modèle SQLAlchemy
    type: Optional[str]
    expediteur: str

    class Config:
        orm_mode = True

class Settings(BaseSettings):
    MAPI_TOKEN: str


    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",  # <- ici on ignore les variables non déclarées
    )
