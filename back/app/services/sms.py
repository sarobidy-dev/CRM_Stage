import os
import requests
from datetime import datetime, timedelta

AUTH_URL = "https://messaging.mapi.mg/api/authentication/login"
SEND_URL = "https://messaging.mapi.mg/api/msg/send"

USERNAME = os.getenv("MAPI_USERNAME")
PASSWORD = os.getenv("MAPI_PASSWORD")

_token_cache = {
    "access_token": None,
    "expires_at": datetime.min
}

def _get_token_from_api():
    print("🔐 Tentative d'authentification à MAPI...")
    payload = {"Username": USERNAME, "Password": PASSWORD}
    try:
        response = requests.post(AUTH_URL, data=payload, timeout=10)
        response.raise_for_status()
        data = response.json()
        token = data.get("token") or data.get("access_token")
        if not token:
            raise Exception("Aucun token reçu.")
        expires_in = data.get("expires_in", 3600)
        _token_cache["access_token"] = token.strip()
        _token_cache["expires_at"] = datetime.utcnow() + timedelta(seconds=expires_in - 60)
        print("✅ Token obtenu avec succès.")
        return token
    except Exception as e:
        print("❌ Erreur lors de l'authentification :", e)
        raise

def get_valid_token():
    now = datetime.utcnow()
    if _token_cache["access_token"] and _token_cache["expires_at"] > now:
        return _token_cache["access_token"]
    return _get_token_from_api()

def send_sms_to_mapi(recipient: str, message: str, channel: str = "sms"):
    token = get_valid_token()
    payload = {
        'Recipient': recipient,
        'Message': message,
        'Channel': channel
    }
    headers = {
        'Authorization': f'{token}'
    }
    try:
        response = requests.post(SEND_URL, headers=headers, data=payload, timeout=10)
        response.raise_for_status()
        print("✅ SMS envoyé avec succès.")
        return response.json()
    except requests.exceptions.RequestException as e:
        detail = f"❌ Erreur envoi SMS : {e}"
        if e.response is not None:
            detail += f" | MAPI: {e.response.status_code} - {e.response.text}"
        print(detail)
        raise Exception(detail)

def reset_token_cache():
    _token_cache["access_token"] = None
    _token_cache["expires_at"] = datetime.min


