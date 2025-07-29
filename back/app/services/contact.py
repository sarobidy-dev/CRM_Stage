from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.contact import Contact


from fastapi import HTTPException, status

async def create_contact(db: AsyncSession, data: dict):
    if "email" in data and data["email"]:
        result = await db.execute(select(Contact).where(Contact.email == data["email"]))
        existing_email = result.scalars().first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Cet email est déjà utilisé."
            )
    
    if "telephone" in data and data["telephone"]:
        result = await db.execute(select(Contact).where(Contact.telephone == data["telephone"]))
        existing_tel = result.scalars().first()
        if existing_tel:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ce numéro de téléphone est déjà utilisé."
            )
    
    try:
        obj = Contact(**data)
        db.add(obj)
        await db.commit()
        await db.refresh(obj)
        return obj
    except Exception as e:
        await db.rollback()
        raise e


async def get_all_contacts(db: AsyncSession):
    result = await db.execute(select(Contact))
    return result.scalars().all()
async def get_contact_by_id(db: AsyncSession, id: int):
    result = await db.execute(select(Contact).where(Contact.id == id))
    return result.scalars().first()
async def update_contact(db: AsyncSession, id: int, data: dict):
    result = await db.execute(select(Contact).where(Contact.id == id))
    obj = result.scalars().first()
    if obj:
        for key, value in data.items():
            setattr(obj, key, value)
        try:
            await db.commit()
            await db.refresh(obj)
        except Exception as e:
            await db.rollback()
            raise e
    return obj


async def delete_contact(db: AsyncSession, id: int):
    result = await db.execute(select(Contact).where(Contact.id == id))
    obj = result.scalars().first()
    if obj:
        await db.delete(obj)
        await db.commit()
    return obj
