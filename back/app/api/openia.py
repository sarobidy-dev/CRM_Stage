# routers/openai.py
from fastapi import APIRouter, HTTPException
from schemas.openia import OpenAIRequest, OpenAIResponse
from services.openia import get_openai_response

router = APIRouter(
    prefix="/openia",
    tags=["OpenAI"]  # ✅ Ajout du tag pour documentation Swagger
)

@router.post("/ask", response_model=OpenAIResponse)
async def ask_openai(request: OpenAIRequest):
    try:
        result = await get_openai_response(request)
        return OpenAIResponse(response=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
