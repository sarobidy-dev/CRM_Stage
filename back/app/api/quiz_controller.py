# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from typing import List  


# from services.ai_service import ai_service
# from database import get_db

# router = APIRouter()

# @router.post("/quizzes/", response_model=schemas.Quiz)
# def create_quiz(quiz: schemas.QuizCreate, db: Session = Depends(get_db)):
#     print("Received quiz data:", quiz.dict())
#     return ai_service.create_quiz(db=db, quiz=quiz)

# @router.get("/quizzes/filter/", response_model=List[schemas.Quiz])
# def read_quizzes_by_user_and_category(
#     user_id: str = None, 
#     category: str = None,
#     db: Session = Depends(get_db)
# ):
#     """
#     Get quizzes filtered by user_id and/or category.
#     Both parameters are optional - if none provided, returns all quizzes.
#     """
#     quizzes = ai_service.get_quizzes_by_user_and_category(
#         db, 
#         user_id=user_id, 
#         category=category
#     )
#     return quizzes

# @router.get("/quizzes/{quiz_id}", response_model=schemas.Quiz)
# def read_quiz(quiz_id: int, db: Session = Depends(get_db)):
#     db_quiz = ai_service.get_quiz(db, quiz_id=quiz_id)
#     if db_quiz is None:
#         raise HTTPException(status_code=404, detail="Quiz not found")
#     return db_quiz

# @router.get("/quizzes/", response_model=List[schemas.Quiz])
# def read_all_quizzes(db: Session = Depends(get_db)):
#     quizzes = ai_service.get_all_quizzes(db)
#     return quizzes

# @router.post("/evaluate-answer/", response_model=schemas.AnswerEvaluationResponse)
# async def evaluate_answer(
#     answer_request: schemas.AnswerEvaluationRequest, 
#     db: Session = Depends(get_db)
# ):
#     """
#     Evaluate a user's answer to a question using AI.
#     Returns whether the answer is correct, feedback, and the correct answer if wrong.
#     """
#     try:
#         return await ai_service.evaluate_answer(
#             question=answer_request.question,
#             user_answer=answer_request.answer
#         )
#     except Exception as e:
#         print(f"Error in evaluate_answer endpoint: {str(e)}")
#         raise HTTPException(
#             status_code=500,
#             detail=f"Error evaluating answer: {str(e)}"
#         )