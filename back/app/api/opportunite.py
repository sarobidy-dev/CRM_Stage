from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from sqlalchemy import select
from models.opportunite import Opportunite
from schemas.opportunite import OpportuniteCreate, OpportuniteRead
from crud.opportunite import create_opportunite, get_opportunites, get_opportunite, delete_opportunite
from database import get_async_session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select
router = APIRouter(prefix="/opportunites", tags=["opportunites"])

@router.get("/count", summary="Nombre total d'opportunités")
async def count_opportunites(session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(func.count()).select_from(Opportunite))
    return {"total_opportunites": result.scalar_one()}

@router.post("", response_model=OpportuniteRead, status_code=status.HTTP_201_CREATED)
async def create(data: OpportuniteCreate, session: AsyncSession = Depends(get_async_session)):
    return await create_opportunite(session, data)

@router.get("", response_model=List[OpportuniteRead])
async def read_all(session: AsyncSession = Depends(get_async_session)):
    return await get_opportunites(session)

@router.get("/{opportunite_id}", response_model=OpportuniteRead)
async def read_one(opportunite_id: int, session: AsyncSession = Depends(get_async_session)):
    opp = await get_opportunite(session, opportunite_id)
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunité non trouvée")
    return opp

@router.delete("/{opportunite_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete(opportunite_id: int, session: AsyncSession = Depends(get_async_session)):
    deleted = await delete_opportunite(session, opportunite_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Opportunité non trouvée")
    return None
