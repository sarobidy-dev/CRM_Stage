from fastapi import APIRouter, Depends, HTTPException
from crud.email_service import EmailService
from schemas.email import EmailRequest

router = APIRouter()
email_service = EmailService()

@router.post("/send-email")
async def send_email(email_request: EmailRequest):
    try:
        success = email_service.send_email(
            recipient=email_request.destinator,
            subject=email_request.subject,
            body=email_request.body
        )
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to send email")
            
        return {"message": "Email sent successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))