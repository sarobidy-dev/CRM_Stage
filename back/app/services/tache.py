from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from models.tache import Tache
from schemas.tache import TacheCreate, TacheUpdate

async def create_tache_service(db: AsyncSession, data: TacheCreate) -> Tache:
    tache = Tache(**data.dict())
    db.add(tache)
    await db.commit()
    await db.refresh(tache)
    return tache

async def get_taches_by_contact_service(db: AsyncSession, contact_id: int) -> list[Tache]:
    result = await db.execute(select(Tache).where(Tache.contact_id == contact_id))
    return result.scalars().all()

async def update_tache_service(db: AsyncSession, tache_id: int, data: TacheUpdate) -> Tache:
    result = await db.execute(select(Tache).where(Tache.id == tache_id))
    tache = result.scalars().first()
    if not tache:
        raise HTTPException(status_code=404, detail="Tâche non trouvée")
    for key, value in data.dict(exclude_unset=True).items():
        setattr(tache, key, value)
    await db.commit()
    await db.refresh(tache)
    return tache

async def delete_tache_service(db: AsyncSession, tache_id: int) -> None:
    result = await db.execute(select(Tache).where(Tache.id == tache_id))
    tache = result.scalars().first()
    if not tache:
        raise HTTPException(status_code=404, detail="Tâche non trouvée")
    await db.delete(tache)
    await db.commit()
