from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from services.sms import send_sms_via_mapi
from database import get_async_session
from schemas.sms import SendSMSRequest, SMSOut, Settings

router = APIRouter()
settings = Settings()  # Assure-toi que MAPI_TOKEN est bien dans Settings

@router.post("/send", response_model=SMSOut)
async def send_sms_endpoint(sms: SendSMSRequest, db: AsyncSession = Depends(get_async_session)):
    try:
        # Envoi SMS via API MAPI avec token depuis settings
        result = await send_sms_via_mapi(
            numero=sms.expediteur,
            message=sms.message,
            token=settings.MAPI_TOKEN
        )
        # Retourner ici la réponse d’envoi, ou construire un SMSOut à partir de result
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
