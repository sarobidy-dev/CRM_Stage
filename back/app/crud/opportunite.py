from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.opportunite import Opportunite
from app.schemas.opportunite import OpportuniteCreate
from sqlalchemy import select, func

async def count_opportunite(session: AsyncSession) -> int:
    result = await session.execute(select(func.count()).select_from(Opportunite))
    return result.scalar_one()

async def create_opportunite(session: AsyncSession, data: OpportuniteCreate):
    opportunite = Opportunite(**data.dict())
    session.add(opportunite)
    await session.commit()
    await session.refresh(opportunite)
    return opportunite

async def get_opportunites(session: AsyncSession):
    result = await session.execute(select(Opportunite))
    return result.scalars().all()

async def get_opportunite(session: AsyncSession, opportunite_id: int):
    result = await session.execute(select(Opportunite).where(Opportunite.id_opportunite == opportunite_id))
    return result.scalar_one_or_none()

async def delete_opportunite(session: AsyncSession, opportunite_id: int):
    opportunite = await get_opportunite(session, opportunite_id)
    if opportunite:
        await session.delete(opportunite)
        await session.commit()
        return True
    return False
