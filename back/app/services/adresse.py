from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.adresse import Adresse


async def create_adresse(db: AsyncSession, data: dict):
    obj = Adresse(**data)
    db.add(obj)
    try:
        await db.commit()
        await db.refresh(obj)
        return obj
    except Exception as e:
        await db.rollback()
        raise e


async def get_all_adresses(db: AsyncSession):
    result = await db.execute(select(Adresse))
    return result.scalars().all()


async def get_adresse_by_id(db: AsyncSession, id: int):
    result = await db.execute(select(Adresse).where(Adresse.id == id))
    return result.scalars().first()


async def update_adresse(db: AsyncSession, id: int, data: dict):
    result = await db.execute(select(Adresse).where(Adresse.id == id))
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


async def delete_adresse(db: AsyncSession, id: int):
    result = await db.execute(select(Adresse).where(Adresse.id == id))
    obj = result.scalars().first()
    if obj:
        await db.delete(obj)
        await db.commit()
    return obj
