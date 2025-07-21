from fastapi import FastAPI
from agora_token_builder import RtcTokenBuilder
import os, time

app = FastAPI()

@app.get("/agora-token")
def get_agora_token(channel_name: str, uid: int = 0):
    app_id = os.getenv("AGORA_APP_ID")
    app_cert = os.getenv("AGORA_CERTIFICATE")
    expire_time = 3600
    current_time = int(time.time())
    expire_at = current_time + expire_time

    token = RtcTokenBuilder.buildTokenWithUid(
        app_id, app_cert, channel_name, uid, 1, expire_at
    )

    return {
        "token": token,
        "appId": app_id,
        "channelName": channel_name,
        "uid": uid
    }
