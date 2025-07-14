from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from sqlalchemy.future import select

from app.schemas import tache as tache_schema
from app.crud import tache as crud_tache   # alias utilisé ici
from app.database import get_async_session
from app.models.tache import Tache

router = APIRouter(prefix="/taches", tags=["Taches"])


@router.post("", response_model=tache_schema.Tache)
async def create_tache(tache: tache_schema.TacheCreate, db: AsyncSession = Depends(get_async_session)):
    return await crud_tache.create_tache(db=db, tache=tache)  # <- correction ici


@router.get("", response_model=List[tache_schema.Tache])
async def read_taches(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_async_session)):
    result = await db.execute(select(Tache).offset(skip).limit(limit))
    return result.scalars().all()


@router.get("/{id_tache}", response_model=tache_schema.Tache)
async def read_tache(id_tache: int, db: AsyncSession = Depends(get_async_session)):
    db_tache = await crud_tache.get_tache(db=db, id_tache=id_tache)  
    if not db_tache:
        raise HTTPException(status_code=404, detail="Tache not found")
    return db_tache


@router.put("/{id_tache}", response_model=tache_schema.Tache)
async def update_tache(id_tache: int, tache_update: tache_schema.TacheUpdate, db: AsyncSession = Depends(get_async_session)):
    db_tache = await crud_tache.update_tache(db=db, id_tache=id_tache, tache_update=tache_update)  # <- correction ici
    if not db_tache:
        raise HTTPException(status_code=404, detail="Tache not found")
    return db_tache


@router.delete("/{id_tache}", response_model=tache_schema.Tache)
async def delete_tache(id_tache: int, db: AsyncSession = Depends(get_async_session)):
    db_tache = await crud_tache.delete_tache(db=db, id_tache=id_tache)  # <- correction ici
    if not db_tache:
        raise HTTPException(status_code=404, detail="Tache not found")
    return db_tache
