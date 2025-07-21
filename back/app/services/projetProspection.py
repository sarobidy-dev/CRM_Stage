from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.projetProspection import ProjetProspection


async def create_projet_prospection(db: AsyncSession, data: dict):
    projet = ProjetProspection(**data)
    db.add(projet)
    await db.commit()
    await db.refresh(projet)
    return projet


async def get_all_projets(db: AsyncSession):
    result = await db.execute(select(ProjetProspection))
    return result.scalars().all()


async def get_projet_by_id(db: AsyncSession, projet_id: int):
    result = await db.execute(
        select(ProjetProspection).where(ProjetProspection.id == projet_id)
    )
    return result.scalars().first()


async def update_projet_prospection(db: AsyncSession, projet_id: int, data: dict):
    result = await db.execute(
        select(ProjetProspection).where(ProjetProspection.id == projet_id)
    )
    projet = result.scalars().first()
    if projet:
        for key, value in data.items():
            setattr(projet, key, value)
        await db.commit()
        await db.refresh(projet)
    return projet


async def delete_projet_prospection(db: AsyncSession, projet_id: int):
    result = await db.execute(
        select(ProjetProspection).where(ProjetProspection.id == projet_id)
    )
    projet = result.scalars().first()
    if projet:
        await db.delete(projet)
        await db.commit()
    return projet
