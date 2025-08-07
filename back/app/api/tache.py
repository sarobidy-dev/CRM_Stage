from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from models.tache import Tache
from database import get_async_session
from schemas.tache import TacheCreate, TacheUpdate, TacheOut
from sqlalchemy.future import select

router = APIRouter(prefix="/taches", tags=["Taches"])

@router.post("/", response_model=TacheOut)
async def create_tache(tache: TacheCreate, db: AsyncSession = Depends(get_async_session)):
    new_tache = Tache(**tache.dict())
    db.add(new_tache)
    await db.commit()
    await db.refresh(new_tache)
    return new_tache

@router.get("/contact/{contact_id}", response_model=list[TacheOut])
async def get_taches_by_contact(contact_id: int, db: AsyncSession = Depends(get_async_session)):
    result = await db.execute(select(Tache).where(Tache.contact_id == contact_id))
    return result.scalars().all()

@router.patch("/{tache_id}", response_model=TacheOut)
async def update_tache(tache_id: int, data: TacheUpdate, db: AsyncSession = Depends(get_async_session)):
    result = await db.execute(select(Tache).where(Tache.id == tache_id))
    tache = result.scalars().first()
    if not tache:
        raise HTTPException(status_code=404, detail="Tâche non trouvée")
    for key, value in data.dict(exclude_unset=True).items():
        setattr(tache, key, value)
    await db.commit()
    await db.refresh(tache)
    return tache

@router.delete("/{tache_id}")
async def delete_tache(tache_id: int, db: AsyncSession = Depends(get_async_session)):
    result = await db.execute(select(Tache).where(Tache.id == tache_id))
    tache = result.scalars().first()
    if not tache:
        raise HTTPException(status_code=404, detail="Tâche non trouvée")
    await db.delete(tache)
    await db.commit()
    return {"detail": "Tâche supprimée"}
