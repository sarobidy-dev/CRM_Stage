from pydantic import BaseModel, EmailStr

class EmailRequest(BaseModel):
    destinator: EmailStr
    subject: str
    body: str