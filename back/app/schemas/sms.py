from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from pydantic_settings import BaseSettings, SettingsConfigDict

# ✅ Schéma pour l'envoi d'un SMS
from pydantic import BaseModel, Field, validator

class SendSMSRequest(BaseModel):
    recipient: str = Field(..., alias="Recipient")
    message: str = Field(..., alias="Message")
    channel: str = Field(default="sms", alias="Channel")

    @validator("recipient")
    def validate_recipient(cls, v):
        if not v.startswith(("0", "261", "+261")):
            raise ValueError("Le numéro doit commencer par 0, 261 ou +261")
        return v


class SMSOut(BaseModel):
    id: int
    id_contact: Optional[int]
    message: str
    date_envoyee: datetime
    statut: str
    type: Optional[str]
    expediteur: str

    class Config:
        orm_mode = True

# ✅ Paramètres d'environnement pour MAPI
class Settings(BaseSettings):
    MAPI_USERNAME: str
    MAPI_PASSWORD: str

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",  # Ignore les variables non déclarées
    )
