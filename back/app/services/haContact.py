from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.haContact import HAContact


async def create_ha_contact(db: AsyncSession, data: dict):
    obj = HAContact(**data)
    db.add(obj)
    try:
        await db.commit()
        await db.refresh(obj)
        return obj
    except Exception as e:
        await db.rollback()
        raise e


async def get_all_ha_contacts(db: AsyncSession):
    result = await db.execute(select(HAContact))
    return result.scalars().all()


async def get_ha_contact_by_id(db: AsyncSession, id: int):
    result = await db.execute(select(HAContact).where(HAContact.id == id))
    return result.scalars().first()


async def delete_ha_contact(db: AsyncSession, id: int):
    result = await db.execute(select(HAContact).where(HAContact.id == id))
    obj = result.scalars().first()
    if obj:
        await db.delete(obj)
        await db.commit()
    return obj
