from pydantic import BaseModel
from datetime import datetime
from typing import Optional

from schemas.contact import ContactResponse


class EmailBase(BaseModel):
    id_contact: int
    objet: str
    message: str
    date_envoyee: Optional[datetime] = None

class EmailCreate(EmailBase):
    pass

class EmailResponse(EmailBase):
    id_email: int
    date_envoyee: datetime
    contact: ContactResponse  # relation vers le contact

    class Config:
        orm_mode = True
