from fastapi import APIRouter, Depends,HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from schemas.emails import EmailCreate, EmailResponse
from services.email import create_email, delete_email, get_all_emails
from database import get_async_session

router = APIRouter(prefix="/email", tags=["Emails"])


@router.delete("/{email_id}", status_code=204)
async def remove_email(email_id: int, db: AsyncSession = Depends(get_async_session)):
    deleted = await delete_email(db, email_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Email not found")
    return None
@router.post("/", response_model=EmailResponse)
async def add_email(email_data: EmailCreate, db: AsyncSession = Depends(get_async_session)):
    db_email = await create_email(db, email_data)
    return db_email

@router.get("/", response_model=List[EmailResponse])
async def list_emails(db: AsyncSession = Depends(get_async_session)):
    emails = await get_all_emails(db)
    return emails
