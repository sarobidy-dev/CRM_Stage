from pydantic import BaseModel

class OpenAIRequest(BaseModel):
    prompt: str
    model: str = "gpt-3.5-turbo"

class OpenAIResponse(BaseModel):
    response: str
