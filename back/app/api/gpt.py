from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.gpt import ask_gpt

router = APIRouter()

class ChatRequest(BaseModel):
    prompt: str

@router.post("/chat-gpt5")
async def chat_with_gpt5(request: ChatRequest):
    try:
        result = ask_gpt(request.prompt)
        return {"response": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
