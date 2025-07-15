from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from database import get_async_session
from models.entreprise import Entreprise
from schemas.entreprise import EntrepriseCreate, EntrepriseRead, EntrepriseUpdate
from sqlalchemy.future import select

router = APIRouter(prefix="/entreprises", tags=["entreprises"])

@router.post("", response_model=EntrepriseRead, status_code=status.HTTP_201_CREATED)
async def create_entreprise(entreprise: EntrepriseCreate, session: AsyncSession = Depends(get_async_session)):
    new_entreprise = Entreprise(**entreprise.dict())
    session.add(new_entreprise)
    await session.commit()
    await session.refresh(new_entreprise)
    return new_entreprise

@router.get("", response_model=List[EntrepriseRead])
async def get_entreprises(session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(Entreprise))
    return result.scalars().all()

@router.get("/{entreprise_id}", response_model=EntrepriseRead)
async def get_entreprise(entreprise_id: int, session: AsyncSession = Depends(get_async_session)):
    result = await session.get(Entreprise, entreprise_id)
    if not result:
        raise HTTPException(status_code=404, detail="Entreprise not found")
    return result

@router.put("/{entreprise_id}", response_model=EntrepriseRead)
async def update_entreprise(entreprise_id: int, updated: EntrepriseUpdate, session: AsyncSession = Depends(get_async_session)):
    db_entreprise = await session.get(Entreprise, entreprise_id)
    if not db_entreprise:
        raise HTTPException(status_code=404, detail="Entreprise not found")
    for field, value in updated.dict(exclude_unset=True).items():
        setattr(db_entreprise, field, value)
    await session.commit()
    await session.refresh(db_entreprise)
    return db_entreprise

@router.delete("/{entreprise_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_entreprise(entreprise_id: int, session: AsyncSession = Depends(get_async_session)):
    db_entreprise = await session.get(Entreprise, entreprise_id)
    if not db_entreprise:
        raise HTTPException(status_code=404, detail="Entreprise not found")
    await session.delete(db_entreprise)
    await session.commit()
    return None
