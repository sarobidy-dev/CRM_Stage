from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from database import get_async_session
from schemas.sms import SendSMSRequest, SMSOut
from models.sms import SMS
from fastapi import APIRouter, HTTPException
from schemas.sms import SendSMSRequest
from services.sms import send_sms_to_mapi


router = APIRouter()
# --- Auth models ---
class LoginRequest(BaseModel):
    Username: str
    Password: str

class LoginResponse(BaseModel):
    token: str

# --- Route login ---
@router.post("/api/auth/login", response_model=LoginResponse)
async def login(data: LoginRequest):
    # Ici, tu remplaces par ta vraie logique d’authentification
    if data.username == "1234567890" and data.password == "Bidy28032005@":
        # Ici, génère un vrai token JWT ou autre
        token = "fake-jwt-token"
        return LoginResponse(token=token)
    raise HTTPException(status_code=401, detail="Identifiants invalides")

# --- Route envoi SMS ---


@router.post("/send")
def send_sms(data: SendSMSRequest):
    try:
        result = send_sms_to_mapi(data.recipient, data.message, data.channel)
        return {"status": "success", "mapi_response": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Route récupération SMS ---
@router.get("/messages", response_model=List[SMSOut])
async def list_sent_sms(db: AsyncSession = Depends(get_async_session)):
    try:
        result = await db.execute(select(SMS).order_by(SMS.date_envoyee.desc()))
        messages = result.scalars().all()
        return messages
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
