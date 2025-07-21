from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.contact import Contact


async def create_contact(db: AsyncSession, data: dict):
<<<<<<< HEAD
    try:
        obj = Contact(**data)  # Contact est ton modèle SQLAlchemy
        db.add(obj)
=======
    obj = Contact(**data)
    db.add(obj)
    try:
>>>>>>> c30d4e42dc3b458af4b31e95d80d16f7cd91d065
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
