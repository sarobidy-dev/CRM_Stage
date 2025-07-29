import requests
import asyncio
from concurrent.futures import ThreadPoolExecutor
from sqlalchemy.ext.asyncio import AsyncSession
from models.sms import SMS

_executor = ThreadPoolExecutor()

def _send_sms_sync(numero: str, message: str, token: str):
    token = token.strip()  # Nettoyage important ici
    url = "https://messaging.mapi.mg/api/msg/send"
    payload = {
        'Recipient': numero,
        'Message': message,
        'Channel': 'sms'
    }
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
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

