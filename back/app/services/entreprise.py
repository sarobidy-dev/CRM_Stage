from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.entreprise import Entreprise


async def create_entreprise(db: AsyncSession, data: dict):
    obj = Entreprise(**data)
    db.add(obj)
    try:
        await db.commit()
        await db.refresh(obj)
        return obj
    except Exception as e:
        await db.rollback()
        raise e


async def get_all_entreprises(db: AsyncSession):
    result = await db.execute(select(Entreprise))
    return result.scalars().all()


async def get_entreprise_by_id(db: AsyncSession, id: int):
    result = await db.execute(select(Entreprise).where(Entreprise.id == id))
    return result.scalars().first()


async def update_entreprise(db: AsyncSession, id: int, data: dict):
    result = await db.execute(select(Entreprise).where(Entreprise.id == id))
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


async def delete_entreprise(db: AsyncSession, id: int):
    result = await db.execute(select(Entreprise).where(Entreprise.id == id))
    obj = result.scalars().first()
    if obj:
        await db.delete(obj)
        await db.commit()
    return obj
