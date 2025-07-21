from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.campagneEntreprise import CampagneEntreprise


async def create_campagne_entreprise(db: AsyncSession, data: dict):
    obj = CampagneEntreprise(**data)
    db.add(obj)
    try:
        await db.commit()
        await db.refresh(obj)
        return obj
    except Exception as e:
        await db.rollback()
        raise e


async def get_all_campagne_entreprises(db: AsyncSession):
    result = await db.execute(select(CampagneEntreprise))
    return result.scalars().all()


async def get_campagne_entreprise_by_id(db: AsyncSession, id: int):
    result = await db.execute(select(CampagneEntreprise).where(CampagneEntreprise.id == id))
    return result.scalars().first()


async def delete_campagne_entreprise(db: AsyncSession, id: int):
    result = await db.execute(select(CampagneEntreprise).where(CampagneEntreprise.id == id))
    obj = result.scalars().first()
    if obj:
        await db.delete(obj)
        await db.commit()
    return obj
