from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from services.sms import save_sms_to_db, send_sms_via_mapi
from database import get_async_session
from schemas.sms import SendSMSRequest, SMSOut, Settings
from datetime import datetime
import random

router = APIRouter()
settings = Settings()  # Assure-toi que MAPI_TOKEN est bien dans le fichier .env

@router.post("/send", response_model=SMSOut)
async def send_sms_endpoint(sms: SendSMSRequest, db: AsyncSession = Depends(get_async_session)):
    try:
        # Envoi SMS via l'API MAPI
        await send_sms_via_mapi(
            numero=sms.expediteur,
            message=sms.message,
            token=settings.MAPI_TOKEN
        )

        # Sauvegarde en base
        sms_record = await save_sms_to_db(db=db, sms_data=sms, statut="envoyé")

        return sms_record

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    
    
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_async_session
from schemas.sms import SMSOut
from models.sms import SMS
from typing import List

# ... (ta route POST déjà présente ici)

@router.get("/messages", response_model=List[SMSOut])
async def list_sent_sms(db: AsyncSession = Depends(get_async_session)):
    try:
        result = await db.execute(select(SMS).order_by(SMS.date_envoyee.desc()))
        messages = result.scalars().all()
        return messages
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
