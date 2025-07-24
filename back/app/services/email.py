from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.email import EmailEnvoye
from schemas.emails import EmailCreate
from datetime import datetime
from sqlalchemy.orm import selectinload
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession
from models.email import EmailEnvoye  # ton modèle SQLAlchemy

async def delete_email(db: AsyncSession, email_id: int) -> bool:
    stmt = delete(EmailEnvoye).where(EmailEnvoye.id_email == email_id)
    result = await db.execute(stmt)
    await db.commit()
    return result.rowcount > 0

async def create_email(db: AsyncSession, email_data: EmailCreate):
    db_email = EmailEnvoye(
        id_contact=email_data.id_contact,
        objet=email_data.objet,
        message=email_data.message,
        date_envoyee=email_data.date_envoyee
    )
    db.add(db_email)
    await db.commit()
    await db.refresh(db_email)

    stmt = select(EmailEnvoye).options(selectinload(EmailEnvoye.contact)).filter(EmailEnvoye.id_email == db_email.id_email)
    result = await db.execute(stmt)
    email_with_contact = result.scalars().first()

    return email_with_contact

async def get_all_emails(db: AsyncSession):
    stmt = select(EmailEnvoye).options(selectinload(EmailEnvoye.contact))
    result = await db.execute(stmt)
    emails = result.scalars().all()
    return emails
