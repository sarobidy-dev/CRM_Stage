from typing import Dict, Any
from app.schemas.quiz import AnswerEvaluationResponse
from openai import AsyncOpenAI
from dotenv import load_dotenv
import os

load_dotenv()

print(f"Using OpenAI key: {os.getenv('OPENAI_API_KEY')[:5]}...")

class AIService:
    def __init__(self, model_type: str = "gpt"):
        self.model_type = model_type
        self.client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    async def evaluate_answer(self, question: str, user_answer: str) -> AnswerEvaluationResponse:
        if self.model_type == "gpt":
            return await self._evaluate_with_gpt(question, user_answer)
        else:
            return AnswerEvaluationResponse(
                is_correct=False,
                feedback="Alternative evaluation not implemented",
                correct_answer="Unknown"
            )

    async def _evaluate_with_gpt(self, question: str, user_answer: str) -> AnswerEvaluationResponse:
        prompt = f"""
        You are an expert quiz evaluator. Your task is to:
        1. Determine if the user's answer is correct for the given question
        2. Provide brief feedback
        3. Give the correct answer if the user was wrong

        Question: {question}
        User's answer: {user_answer}

        Respond in JSON format with these keys:
        - is_correct (boolean)
        - feedback (string)
        - correct_answer (string, only if is_correct is false)
        """

        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            
            result = response.choices[0].message.content
            return AnswerEvaluationResponse.model_validate_json(result)
            
        except Exception as e:
            print(f"Error calling OpenAI: {str(e)}")
            return AnswerEvaluationResponse(
                is_correct=False,
                feedback="Unable to evaluate answer at this time",
                correct_answer="Unknown"
            )

# Initialize the service
ai_service = AIService(model_type="gpt")