import requests
import asyncio
from concurrent.futures import ThreadPoolExecutor
from sqlalchemy.ext.asyncio import AsyncSession
from models.sms import SMS

_executor = ThreadPoolExecutor()
from sqlalchemy.ext.asyncio import AsyncSession
from models.sms import SMS
from schemas.sms import SendSMSRequest
from datetime import datetime

async def save_sms_to_db(
    db: AsyncSession,
    sms_data: SendSMSRequest,
    statut: str = "envoyé"
) -> SMS:
    sms = SMS(
        id_contact=sms_data.id_contact or 0,
        message=sms_data.message,
        telephone=sms_data.expediteur,
        date_envoyee=datetime.utcnow(),
        statut=statut,
        type=sms_data.type or "sms",
        expediteur=sms_data.expediteur
    )
    db.add(sms)
    await db.commit()
    await db.refresh(sms)
    return sms

def _send_sms_sync(numero: str, message: str, token: str):
    token = token.strip() 
    url = "https://messaging.mapi.mg/api/msg/send"
    payload = {
        'Recipient': numero,
        'Message': message,
        'Channel': 'sms'
    }
    headers = {
        'Authorization': "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvbWVzc2FnaW5nLm1hcGkubWdcLyIsImlhdCI6MTc1NDU1Mzc1OCwiZXhwIjoxNzU0NTU3MzU4LCJ1c2VybmFtZSI6IjEyMzQ1Njc4OTAiLCJ1c2VyaWQiOjQ2N30.XxfyWuKSxkPrNq_ah91ZkYGdt5NBCDXQldPUhiNlbqw",
    }
    try:
        response = requests.post(url, headers=headers, data=payload)
        if response.status_code == 200:
            print(f"🤣🤣🤣SMS envoyé avec succès au numéro {numero}")
            return response.json()
        else:
            print(f"😭😭😭Erreur lors de l'envoi du SMS au numéro {numero}: {response.status_code} - {response.text}")
            raise Exception(f"😡😡😡Erreur envoi SMS: {response.status_code} - {response.text}")
    except Exception as e:
        print(f" Exception lors de l'envoi du SMS au numéro {numero}: {e}")
        raise
async def send_sms_via_mapi(numero: str, message: str, token: str):
    loop = asyncio.get_running_loop()
    try:
        result = await loop.run_in_executor(_executor, _send_sms_sync, numero, message, token)
        return result
    except Exception as e:
        print(f"L'envoi du SMS a échoué : {e}")
        raise

